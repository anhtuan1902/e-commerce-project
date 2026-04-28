import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../api/auth.api";
import toast from "react-hot-toast";
import { removeTokens } from "@/shared/services/jwt.services";

const useLogout = () => {
    const logout = useAuthStore((s) => s.logout);

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: (data) => {
            logout();
            removeTokens();
            toast.success(data.message || "Đăng xuất thành công");
        },
        onError: (error) => {
            toast.error((error as any).response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.", {
                duration: Infinity,
            })
        },
    });
}

export default useLogout
