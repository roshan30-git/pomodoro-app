
import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: 'bell',
  tickingSound: 'none',
};

export const ALARM_SOUNDS = [
    { id: 'bell', name: 'Bell', url: 'https://www.soundjay.com/buttons/sounds/button-16.mp3' },
    { id: 'bird', name: 'Bird', url: 'https://www.soundjay.com/buttons/sounds/button-7.mp3' },
    { id: 'digital', name: 'Digital', url: 'https://www.soundjay.com/buttons/sounds/button-20.mp3' },
];

export const TICKING_SOUNDS = [
    { id: 'none', name: 'None', url: '' },
    { id: 'fast', name: 'Ticking Fast', url: 'https://www.soundjay.com/clock/sounds/clock-ticking-2.mp3' },
    { id: 'slow', name: 'Ticking Slow', url: 'https://www.soundjay.com/clock/sounds/clock-ticking-1.mp3' },
];
