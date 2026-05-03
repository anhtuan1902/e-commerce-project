import { create } from "zustand";
import { Category, CategoryState } from "../types/categories.type";

export const useCategoriesStore = create<CategoryState>((set) => ({
    categories: [] as Category[],

    setCategories: (categories) =>
        set({
            categories,
        }),
}));
