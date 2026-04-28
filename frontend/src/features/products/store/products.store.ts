import { create } from "zustand";
import { Product, ProductStore, PaginationState } from "../types/product.type";

const initialPagination: PaginationState = {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasMore: true,
    isLoading: false,
};

export const useProductsStore = create<ProductStore>((set, get) => ({
    products: [] as Product[],
    currentProduct: null,
    pagination: initialPagination,
    selectedCategoryId: null,

    setProducts: (products: Product[]) =>
        set({
            products,
            pagination: { ...get().pagination, page: 1, hasMore: false },
        }),

    setProductsWithPagination: (products: Product[], pagination: Omit<PaginationState, 'isLoading'>) =>
        set({
            products,
            pagination: { ...get().pagination, ...pagination },
        }),

    setProduct: (product: Product) =>
        set({
            currentProduct: product,
        }),

    appendProducts: (newProducts: Product[], pagination: Omit<PaginationState, 'isLoading'>) =>
        set((state) => ({
            products: [...state.products, ...newProducts],
            pagination: { ...state.pagination, ...pagination },
        })),

    setLoading: (isLoading: boolean) =>
        set((state) => ({
            pagination: { ...state.pagination, isLoading },
        })),

    resetProducts: () =>
        set({
            products: [],
            pagination: initialPagination,
        }),

    setSelectedCategoryId: (categoryId: string | null) =>
        set({ selectedCategoryId: categoryId }),
}));