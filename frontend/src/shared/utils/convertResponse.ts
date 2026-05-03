import { ApiResponse } from "../types/global.types";

export const convertResponse = <T>(res: ApiResponse<T>) => {
    return {
        data: res.data,
        success: res.success,
        message: res.message,
    };
}