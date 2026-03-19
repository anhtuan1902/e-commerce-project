import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTheme } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = ({ className = '', showLabel = false }: ThemeToggleProps) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.currentTheme);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setCurrentTheme(newTheme));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
      } ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className='flex items-center gap-2'>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        {showLabel && <span>{theme === 'light' ? 'Dark' : 'Light'}</span>}
      </div>
    </button>
  );
};

export default ThemeToggle;
