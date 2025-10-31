export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  name:string;
  estPomos: number;
  actualPomos: number;
  completed: boolean;
  parentId?: string | null;
}

export interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  tickingSound: string;
}