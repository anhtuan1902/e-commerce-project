import api from '@/shared/services/axios.config';
import { ApiResponse, Profile } from '@/shared/types/global.types';
import { convertResponse } from '@/shared/utils/convertResponse';

export const updateProfile = async (data: FormData) => {
    const res = await api.put<ApiResponse<Profile>>('/profiles/me', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return convertResponse(res.data);
};

export const changePassword = async (data: {
    password: string;
    new_password: string;
    confirm_password: string;
}) => {
    const res = await api.put<ApiResponse<void>>('/auth/change-password', data);
    return convertResponse(res.data);
};
