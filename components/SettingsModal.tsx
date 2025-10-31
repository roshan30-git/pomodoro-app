import React, { useState } from 'react';
import { Settings } from '../types';
import { ALARM_SOUNDS, TICKING_SOUNDS } from '../constants';

interface SettingsModalProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onClose: () => void;
}

const NumberInput: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-500 mb-1">{label}</label>
        <input 
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full bg-gray-200 rounded-md p-2 outline-none focus:ring-2 focus:ring-gray-400"
        />
    </div>
);

const SelectInput: React.FC<{ 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    options: { id: string, name: string }[];
}> = ({ label, value, onChange, options }) => (
    <div className="flex justify-between items-center">
        <label className="font-semibold text-gray-700">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-200 rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-gray-400 w-36"
        >
            {options.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
            ))}
        </select>
    </div>
);


export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, setSettings, onClose }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    const handleSave = () => {
        setSettings(localSettings);
        onClose();
    };
    
    const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
        setLocalSettings(prev => ({...prev, [key]: value}));
    }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4 text-gray-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold">Settings</h2>
            <button onClick={onClose} className="text-2xl text-gray-500">&times;</button>
        </div>
        
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold mb-2 uppercase text-sm text-gray-500 tracking-wider">Timer</h3>
                <div className="grid grid-cols-3 gap-4">
                    <NumberInput label="Pomodoro" value={localSettings.pomodoro} onChange={(v) => handleSettingChange('pomodoro', v)} />
                    <NumberInput label="Short Break" value={localSettings.shortBreak} onChange={(v) => handleSettingChange('shortBreak', v)} />
                    <NumberInput label="Long Break" value={localSettings.longBreak} onChange={(v) => handleSettingChange('longBreak', v)} />
                </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
                <label className="font-semibold text-gray-700">Auto start Breaks?</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={localSettings.autoStartBreaks} onChange={(e) => handleSettingChange('autoStartBreaks', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
                <label className="font-semibold text-gray-700">Auto start Pomodoros?</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={localSettings.autoStartPomodoros} onChange={(e) => handleSettingChange('autoStartPomodoros', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
                 <label className="font-semibold text-gray-700">Long Break interval</label>
                 <NumberInput label="" value={localSettings.longBreakInterval} onChange={(v) => handleSettingChange('longBreakInterval', v)} />
            </div>

            <div className="border-t pt-4 space-y-4">
                <SelectInput 
                    label="Alarm Sound"
                    value={localSettings.alarmSound}
                    onChange={(v) => handleSettingChange('alarmSound', v)}
                    options={ALARM_SOUNDS}
                />
                <SelectInput 
                    label="Ticking Sound"
                    value={localSettings.tickingSound}
                    onChange={(v) => handleSettingChange('tickingSound', v)}
                    options={TICKING_SOUNDS}
                />
            </div>
        </div>

        <div className="flex justify-end mt-8 border-t pt-4">
            <button onClick={handleSave} className="px-6 py-2 bg-gray-800 text-white rounded-md font-semibold">
                OK
            </button>
        </div>
      </div>
    </div>
  );
};