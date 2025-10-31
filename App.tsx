
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Timer } from './components/Timer';
import { TaskList } from './components/TaskList';
import { SettingsModal } from './components/SettingsModal';
import { Task, Settings, TimerMode } from './types';
import { DEFAULT_SETTINGS } from './constants';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('pomofocus-settings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('pomofocus-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [pomosSinceLongBreak, setPomosSinceLongBreak] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('pomofocus-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomofocus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTimerEnd = useCallback(() => {
    if (mode === 'pomodoro') {
      if (activeTaskId) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === activeTaskId
              ? { ...task, actualPomos: task.actualPomos + 1 }
              : task
          )
        );
      }

      const newPomoCount = pomosSinceLongBreak + 1;
      setPomosSinceLongBreak(newPomoCount);

      if (newPomoCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('pomodoro');
    }
  }, [mode, activeTaskId, settings.longBreakInterval, pomosSinceLongBreak]);
  
  const backgroundColors: { [key in TimerMode]: string } = {
    pomodoro: 'bg-rose-500',
    shortBreak: 'bg-teal-500',
    longBreak: 'bg-sky-500',
  };

  return (
    <div className={`flex flex-col items-center min-h-screen ${backgroundColors[mode]} transition-colors duration-500 ease-in-out`}>
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="container mx-auto px-4 pt-8 pb-16 flex flex-col items-center">
        <Timer
          settings={settings}
          mode={mode}
          setMode={setMode}
          onTimerEnd={handleTimerEnd}
          key={mode + settings.pomodoro + settings.shortBreak + settings.longBreak}
        />
        <TaskList
          tasks={tasks}
          setTasks={setTasks}
          activeTaskId={activeTaskId}
          setActiveTaskId={setActiveTaskId}
        />
      </main>
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
