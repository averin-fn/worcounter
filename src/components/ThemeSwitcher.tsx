import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  isDarkTheme: boolean;
  onThemeToggle: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isDarkTheme, onThemeToggle }) => {
  return (
    <button
      onClick={onThemeToggle}
      className={`theme-switcher ${isDarkTheme ? 'dark' : 'light'}`}
      aria-label={isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
    >
      <div className="theme-switcher-track">
        <div className={`theme-switcher-thumb ${isDarkTheme ? 'dark-position' : 'light-position'}`}>
          {isDarkTheme ? <Moon size={16} /> : <Sun size={16} />}
        </div>
      </div>
      <span className="theme-switcher-label">
        {isDarkTheme ? 'Темная' : 'Светлая'}
      </span>
    </button>
  );
};

export default ThemeSwitcher;
