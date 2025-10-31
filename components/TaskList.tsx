import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleGenAI, Type } from '@google/genai';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
}

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isActive, onSelect, onToggleComplete, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
  return (
    <div className={`bg-white p-4 rounded-md flex items-center justify-between border-l-4 ${isActive ? 'border-gray-700' : 'border-transparent'} cursor-pointer`} onClick={onSelect}>
      <div className="flex items-center">
        <button onClick={(e) => { e.stopPropagation(); onToggleComplete(); }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${task.completed ? 'bg-gray-700 border-gray-700' : 'border-gray-300'}`}>
          {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
        </button>
        <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 font-semibold">{task.actualPomos}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-400">{task.estPomos}</span>
        <div className="relative">
             <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} className="p-1 rounded-md hover:bg-gray-200">
                <MoreVerticalIcon className="w-5 h-5 text-gray-500" />
            </button>
            {isMenuOpen && (
                 <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
                     <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</button>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};


export const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, activeTaskId, setActiveTaskId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const handleAddTask = () => {
    if (newTaskName.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: newTaskName,
      estPomos: 1,
      actualPomos: 0,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setIsAdding(false);
  };

  const handleBreakdownTask = async () => {
    if (newTaskName.trim() === '' || isBreakingDown) return;
    
    setIsBreakingDown(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const responseSchema = {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: 'The name of the sub-task.',
                },
                estPomos: {
                    type: Type.INTEGER,
                    description: 'The estimated number of pomodoros (must be 1 or 2).'
                }
              },
              required: ['name', 'estPomos'],
            },
        };

        const prompt = `You are a productivity expert specializing in the Pomodoro Technique. Break down the following task into smaller, actionable sub-tasks. Each sub-task should ideally take 1 or 2 Pomodoro sessions (25-50 minutes) to complete. Respond with a JSON array of objects, where each object has a "name" (string) and "estPomos" (integer, 1 or 2). Do not include the main task in your response. If the task is already small enough, return an empty array. The task is: "${newTaskName}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const subTasksResponse = JSON.parse(response.text) as {name: string, estPomos: number}[];
        
        const parentTask: Task = {
            id: crypto.randomUUID(),
            name: newTaskName,
            estPomos: subTasksResponse.reduce((acc, t) => acc + t.estPomos, 0) || 1,
            actualPomos: 0,
            completed: false,
            parentId: null,
        };

        const subTasks: Task[] = subTasksResponse.map(sub => ({
            id: crypto.randomUUID(),
            name: sub.name,
            estPomos: sub.estPomos,
            actualPomos: 0,
            completed: false,
            parentId: parentTask.id,
        }));
        
        setTasks(prev => [...prev, parentTask, ...subTasks]);
        setNewTaskName('');
        setIsAdding(false);

    } catch (error) {
        console.error("Failed to break down task:", error);
        alert("Sorry, I couldn't break down the task. Please try again.");
        // If AI fails, just add the main task
        handleAddTask();
    } finally {
        setIsBreakingDown(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    let newTasks = [...tasks];
    const taskIndex = newTasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const task = newTasks[taskIndex];
    const newCompletedState = !task.completed;

    newTasks[taskIndex] = { ...task, completed: newCompletedState };

    // Cascade down to children if completing a parent
    if (newCompletedState) {
        const queue = [id];
        while(queue.length > 0) {
            const parentId = queue.shift()!;
            const children = newTasks.filter(t => t.parentId === parentId);
            for(const child of children) {
                const childIndex = newTasks.findIndex(t => t.id === child.id);
                if(childIndex !== -1 && !newTasks[childIndex].completed) {
                    newTasks[childIndex] = { ...newTasks[childIndex], completed: true };
                    queue.push(child.id);
                }
            }
        }
    }
    
    // Cascade up to parent if un-completing a subtask
    if (!newCompletedState && task.parentId) {
        let currentParentId: string | null | undefined = task.parentId;
        while(currentParentId) {
            const parentIndex = newTasks.findIndex(t => t.id === currentParentId);
            if (parentIndex !== -1) {
                newTasks[parentIndex] = { ...newTasks[parentIndex], completed: false };
                currentParentId = newTasks[parentIndex].parentId;
            } else {
                currentParentId = null;
            }
        }
    }

    // If completing a subtask, check if parent should be completed
    if (newCompletedState && task.parentId) {
        let parentIdToCheck: string | null | undefined = task.parentId;
        while (parentIdToCheck) {
            const siblings = newTasks.filter(t => t.parentId === parentIdToCheck);
            if (siblings.every(s => s.completed)) {
                const parentIndex = newTasks.findIndex(p => p.id === parentIdToCheck);
                if (parentIndex !== -1) {
                    newTasks[parentIndex] = { ...newTasks[parentIndex], completed: true };
                    parentIdToCheck = newTasks[parentIndex].parentId;
                } else {
                    parentIdToCheck = null;
                }
            } else {
                parentIdToCheck = null;
            }
        }
    }

    setTasks(newTasks);
  };

  const handleDeleteTask = (id: string) => {
    const tasksToDelete = new Set<string>([id]);
    const queue = [id];
    
    while (queue.length > 0) {
        const parentId = queue.shift()!;
        tasks.forEach(t => {
            if (t.parentId === parentId) {
                tasksToDelete.add(t.id);
                queue.push(t.id);
            }
        });
    }
    
    setTasks(tasks.filter(t => !tasksToDelete.has(t.id)));
    if (activeTaskId && tasksToDelete.has(activeTaskId)) {
        setActiveTaskId(null);
    }
  }

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const taskTree = useMemo(() => {
    const taskMap: Map<string, Task & { children: Task[] }> = new Map(
      tasks.map(t => [t.id, { ...t, children: [] }])
    );
    const tree: (Task & { children: Task[] })[] = [];

    for (const task of taskMap.values()) {
      if (task.parentId && taskMap.has(task.parentId)) {
        taskMap.get(task.parentId)!.children.push(task);
      } else {
        tree.push(task);
      }
    }
    return tree;
  }, [tasks]);


  return (
    <div className="w-full max-w-xl mx-auto mt-8 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
      </div>
      
      {activeTask && (
        <div className="mb-4 p-4 rounded-md border-2 border-dashed border-white/50 text-center">
            <p className="font-semibold text-lg">{activeTask.name}</p>
        </div>
      )}

      <div className="space-y-3">
        {taskTree.filter(t => !t.completed).map(task => (
            <React.Fragment key={task.id}>
                <TaskItem 
                    task={task}
                    isActive={task.id === activeTaskId}
                    onSelect={() => setActiveTaskId(task.id)}
                    onToggleComplete={() => handleToggleComplete(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                />
                {task.children.length > 0 && (
                    <div className="pl-8 space-y-3">
                        {task.children.filter(child => !child.completed).map(child => (
                             <TaskItem 
                                key={child.id}
                                task={child}
                                isActive={child.id === activeTaskId}
                                onSelect={() => setActiveTaskId(child.id)}
                                onToggleComplete={() => handleToggleComplete(child.id)}
                                onDelete={() => handleDeleteTask(child.id)}
                            />
                        ))}
                    </div>
                )}
            </React.Fragment>
        ))}
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mt-4 p-4 bg-white/20 border-2 border-dashed border-white/50 rounded-md flex items-center justify-center space-x-2 hover:bg-white/30 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      )}

      {isAdding && (
        <div className="bg-white p-4 rounded-md mt-4">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="What are you working on?"
            className="w-full text-gray-800 text-lg font-semibold bg-transparent outline-none"
            autoFocus
          />
          <div className="flex justify-end items-center space-x-2 mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 rounded-md">
              Cancel
            </button>
            <button onClick={handleAddTask} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50" disabled={isBreakingDown}>
              Save
            </button>
             <button onClick={handleBreakdownTask} className="px-4 py-2 bg-rose-500 text-white rounded-md flex items-center disabled:opacity-50 disabled:bg-rose-400" disabled={isBreakingDown || !newTaskName.trim()}>
              {isBreakingDown ? (
                <span>Working...</span>
              ) : (
                <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    <span>Break Down with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};