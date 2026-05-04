import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearchInput: () => void;
}

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            searchInput: "",

            setSearchInput: (value: string) =>
                set({
                    searchInput: value,
                }),

            clearSearchInput: () =>
                set({
                    searchInput: "",
                }),
        }),
        {
            name: "ui-storage",
        }
    )
);