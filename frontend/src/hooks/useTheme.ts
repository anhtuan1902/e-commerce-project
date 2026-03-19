import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useTheme = () => {
    const theme = useSelector((state: RootState) => state.ui.currentTheme);

    return {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    };
};

export default useTheme;
