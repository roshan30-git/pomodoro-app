
import React from 'react';
import { BarChartIcon } from './icons/BarChartIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { UserIcon } from './icons/UserIcon';
import { CheckIcon } from './icons/CheckIcon';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-3 border-b border-white/20">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CheckIcon className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">Pomofocus</h1>
        </div>
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-white/20 text-white rounded-md text-sm font-medium hover:bg-white/30 transition-colors flex items-center space-x-1.5">
            <BarChartIcon className="h-4 w-4" />
            <span>Report</span>
          </button>
          <button onClick={onSettingsClick} className="px-3 py-1.5 bg-white/20 text-white rounded-md text-sm font-medium hover:bg-white/30 transition-colors flex items-center space-x-1.5">
            <SettingsIcon className="h-4 w-4" />
            <span>Setting</span>
          </button>
          <button className="px-3 py-1.5 bg-white/20 text-white rounded-md text-sm font-medium hover:bg-white/30 transition-colors flex items-center space-x-1.5">
            <UserIcon className="h-4 w-4" />
            <span>Login</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
