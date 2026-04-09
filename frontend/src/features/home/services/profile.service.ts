import { API_ROUTES } from "@/constants";
import api from "@/services/axios.config";
import { ApiResponse } from "@/types/auth.types";
import { Profile, ProfileResponse } from "@/types/profile.type";

const ProfileService = {
    update: async (data: Profile | FormData): Promise<ProfileResponse> => {
        const res = await api.put<ApiResponse<ProfileResponse>>('/profiles/me', data, {
            headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        });
        return res?.data?.data;
    },

    changePassword: async (data: { password: string, new_password: string, confirm_password: string }) => {
        const res = await api.put<ApiResponse<any>>('/auth/change-password', data);
        return res?.data?.data;
    },

    getListAddress: async () => {
        const res = await api.get<ApiResponse<{ addresses: any[] }>>('/addresses');
        return res?.data?.data || [];
    },

    addAddress: async (data: any) => {
        const res = await api.post<ApiResponse<any>>('/addresses', data);
        return {
            result: res?.data?.data,
            success: res?.data?.success,
            message: res?.data?.message,
        };
    },

    updateAddress: async (id: number, data: any) => {
        const res = await api.put<ApiResponse<any>>(`/addresses/${id}`, data);
        return {
            result: res?.data?.data,
            success: res?.data?.success,
            message: res?.data?.message,
        };
    },

    deleteAddress: async (id: number) => {
        const res = await api.delete<ApiResponse<any>>(`/addresses/${id}`);
        return {
            result: res?.data?.data,
            success: res?.data?.success,
            message: res?.data?.message,
        };
    },
}

export default ProfileService