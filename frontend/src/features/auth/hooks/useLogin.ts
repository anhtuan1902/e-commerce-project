import { UserType } from "@/shared/types/global.types";
import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { setRefreshToken, setToken } from "src/shared/services/jwt.services";
import { loginApi } from "../api/auth.api";


export const useLogin = () => {
    const setUser = useAuthStore((s) => s.setUser);
    const navigate = useNavigate();
    const location = useLocation();

    return useMutation({
        mutationFn: loginApi,
        onSuccess: (data) => {
            setUser(data.data.user as UserType);
            setToken(data.data.accessToken);
            setRefreshToken(data.data.refreshToken);

            const redirectParam = new URLSearchParams(location.search).get('redirect');
            const fromState = location.state?.from?.pathname as string | undefined;
            const redirectTo = redirectParam || fromState || '/';
            navigate(redirectTo, { replace: true });
        },
        onError: (error) => {
            toast.error((error as any).response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.", {
                duration: Infinity,
            })
        },
    });
};