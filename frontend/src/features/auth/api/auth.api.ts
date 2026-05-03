import { API_ROUTES } from "src/shared/constants/routes.constants";
import api from "src/shared/services/axios.config";
import { ApiResponse, UserType } from "src/shared/types/global.types";
import { AuthLoginResponse, LoginDto, RegisterDto, RegisterResponse } from "../types/auth.types";

export const loginApi = async (data: LoginDto): Promise<ApiResponse<AuthLoginResponse>> => {
    const res = await api.post<ApiResponse<AuthLoginResponse>>(API_ROUTES.AUTH.LOGIN, data);
    return {
        data: {
            user: res.data.data.user,
            accessToken: res.data.data.accessToken,
            refreshToken: res.data.data.refreshToken,
        },
        success: res.data.success,
        message: res.data.message,
    };
};

export const registerApi = async (data: RegisterDto): Promise<ApiResponse<RegisterResponse>> => {
    const res = await api.post<ApiResponse<RegisterResponse>>('/auth/register', data);
    return {
        data: {
            user: res.data.data.user,
            accessToken: res.data.data.accessToken,
            refreshToken: res.data.data.refreshToken,
        },
        success: res.data.success,
        message: res.data.message,
    };
};

export const logoutApi = async (refreshToken: string): Promise<ApiResponse<UserType>> => {
    const res = await api.post<ApiResponse<UserType>>(API_ROUTES.AUTH.LOGOUT, { refreshToken });
    return {
        data: res.data.data,
        success: res.data.success,
        message: res.data.message,
    }
};

export const getGoogleLoginUrl = () => {
    return `${import.meta.env.VITE_API_URL}${API_ROUTES.AUTH.GOOGLE}`;
};

export const getMeApi = async (): Promise<ApiResponse<UserType>> => {
    const res = await api.get<ApiResponse<UserType>>(API_ROUTES.AUTH.ME);
    return {
        data: res.data.data,
        success: res.data.success,
        message: res.data.message,
    }
}

