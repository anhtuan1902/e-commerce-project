import { UserType } from 'src/shared/types/global.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: UserType | null;
    isAuthenticated: boolean;
    setUser: (user: UserType) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'auth-storage',
        }
    )
);