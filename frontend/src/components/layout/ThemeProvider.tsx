import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTheme } from '../../store/slices/uiSlice';
import { RootState } from '../../store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.currentTheme);

  // Initialize theme from localStorage or system preference - only on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    dispatch(setCurrentTheme(initialTheme));
  }, []);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
