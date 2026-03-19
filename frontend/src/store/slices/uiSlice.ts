import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
    currentView: string;
    currentTheme: 'light' | 'dark';
}

const initialState: UiState = {
    currentView: 'home',
    currentTheme: 'light',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState: initialState,
    reducers: {
        setCurrentView: (state, action: PayloadAction<string>) => {
            state.currentView = action.payload;
        },
        setCurrentTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.currentTheme = action.payload;
        },
    },
});

export const { setCurrentView, setCurrentTheme } = uiSlice.actions;
export default uiSlice.reducer;