import api from "@/shared/services/axios.config";
import { ApiResponse } from "@/shared/types/global.types";
import { Category } from "../types/categories.type";
import { API_ROUTES } from "@/shared/constants/routes.constants";

export const getListCategories = async () => {
    const res = await api.get<ApiResponse<Category>>(API_ROUTES.CATEGORIES);
    return {
        data: res.data.data,
        success: res.data.success,
        message: res.data.message,
    };
}