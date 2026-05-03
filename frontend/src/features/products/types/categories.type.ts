export type Category = {
    id: number;
    name: string;
};

export interface CategoryState {
    categories: Category[];
    setCategories: (categories: Category[]) => void;
}

