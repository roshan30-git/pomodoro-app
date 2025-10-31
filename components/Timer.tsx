
import React, { useEffect, useMemo } from 'react';
import { Settings, TimerMode } from '../types';
import { useTimer } from '../hooks/useTimer';
import { useAudio } from '../hooks/useAudio';
import { ALARM_SOUNDS, TICKING_SOUNDS } from '../constants';

interface TimerProps {
  settings: Settings;
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  onTimerEnd: () => void;
}

const modeDurations = (settings: Settings): Record<TimerMode, number> => ({
    pomodoro: settings.pomodoro * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
});

const modeLabels: Record<TimerMode, string> = {
    pomodoro: "Pomodoro",
    shortBreak: "Short Break",
    longBreak: "Long Break",
}

const ProgressCircle: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
            <circle
                className="text-white/20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                r={radius}
                cx="50%"
                cy="50%"
            />
            <circle
                className="text-white"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="50%"
                cy="50%"
                style={{ transition: 'stroke-dashoffset 0.3s linear' }}
            />
        </svg>
    </div>
  );
};


export const Timer: React.FC<TimerProps> = ({ settings, mode, setMode, onTimerEnd }) => {
    const durations = useMemo(() => modeDurations(settings), [settings]);
    const initialTime = durations[mode];

    const alarmSoundUrl = ALARM_SOUNDS.find(s => s.id === settings.alarmSound)?.url || '';
    const tickingSoundUrl = TICKING_SOUNDS.find(s => s.id === settings.tickingSound)?.url || '';
    
    const alarm = useAudio(alarmSoundUrl);
    const ticker = useAudio(tickingSoundUrl, true);

    const handleEnd = () => {
        alarm.play();
        ticker.stop();
        onTimerEnd();
    };

    const autoStart = mode === 'pomodoro' ? settings.autoStartPomodoros : settings.autoStartBreaks;
    const { timeLeft, isActive, start, pause } = useTimer({ initialTime, onEnd: handleEnd, autoStart });

    useEffect(() => {
        if(isActive) {
            ticker.play();
        } else {
            ticker.pause();
        }
        return () => ticker.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    useEffect(() => {
      document.title = `${Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')} - ${modeLabels[mode]}`;
    }, [timeLeft, mode]);

    const progress = (timeLeft / initialTime) * 100;

    const formattedTime = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

    const buttonClasses = `
        text-2xl font-bold uppercase tracking-widest
        w-48 py-4 rounded-lg transition-all duration-200 ease-in-out
        shadow-[0_6px_0px_0px_rgba(0,0,0,0.2)]
        active:translate-y-1 active:shadow-[0_2px_0px_0px_rgba(0,0,0,0.2)]
    `;

    const modeButtonClasses = (targetMode: TimerMode) => `
        px-4 py-1 rounded-md text-sm font-medium
        ${mode === targetMode ? 'bg-white/20' : 'bg-transparent'}
        hover:bg-white/20 transition-colors
    `;

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 rounded-lg p-6 text-white text-center flex flex-col items-center">
        <div className="flex space-x-2 mb-6">
            <button onClick={() => setMode('pomodoro')} className={modeButtonClasses('pomodoro')}>Pomodoro</button>
            <button onClick={() => setMode('shortBreak')} className={modeButtonClasses('shortBreak')}>Short Break</button>
            <button onClick={() => setMode('longBreak')} className={modeButtonClasses('longBreak')}>Long Break</button>
        </div>

        <div className="relative w-64 h-64 mb-6">
            <ProgressCircle progress={progress} />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-bold tracking-tighter">{formattedTime}</span>
            </div>
        </div>

        <button onClick={isActive ? pause : start} className={`bg-white text-current ${buttonClasses}`}>
            {isActive ? 'Pause' : 'Start'}
        </button>
    </div>
  );
};
