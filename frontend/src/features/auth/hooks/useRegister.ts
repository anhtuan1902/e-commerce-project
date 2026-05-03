import { useMutation } from '@tanstack/react-query';
import { registerApi } from '../api/auth.api';
import toast from 'react-hot-toast';
import { User } from '@/shared/types/global.types';
import { useAuthStore } from '@/store/auth.store';
import { setRefreshToken, setToken } from '@/shared/services/jwt.services';

export const useRegister = () => {
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: registerApi,
        onSuccess: (data) => {
            setUser(data.data.user as User);
            setToken(data.data.accessToken as string);
            setRefreshToken(data.data.refreshToken as string);
        },
        onError: (error) => {
            toast.error((error as any).response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.", {
                duration: Infinity,
            })
        },
    });
};