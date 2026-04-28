import api from "@/shared/services/axios.config";
import { ApiResponse } from "@/shared/types/global.types";
import { Product } from "../types/product.type";
import { API_ROUTES } from "@/shared/constants/routes.constants";

export interface PaginatedProductsResponse {
    data: Product[];
    total_items: number;
    total_pages: number;
}

export const getProductById = async (id: string | number): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`${API_ROUTES.PRODUCTS}/${id}`);
    return res.data.data;
};

export interface ProductApiResponse {
    data: Product[];
    pagination: {
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
    success: boolean;
    message: string;
}

export const getListProducts = async (page = 1, limit = 25, category_id?: string): Promise<ProductApiResponse> => {
    const res = await api.get<ApiResponse<PaginatedProductsResponse>>(API_ROUTES.PRODUCTS, {
        params: { page, limit, category_id },
    });
    return {
        data: res.data.data.data,
        pagination: {
            total: res.data.data.total_items,
            totalPages: res.data.data.total_pages,
            hasMore: res.data.data.total_items > page * limit,
        },
        success: res.data.success,
        message: res.data.message,
    };
};