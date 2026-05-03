import { UserType } from "@/shared/types/global.types";
import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getMeApi } from "../api/auth.api";


const useGetProfile = () => {
    const setUser = useAuthStore((s) => s.setUser);
    return useMutation({
        mutationFn: getMeApi,
        onSuccess: (data) => {
            setUser(data.data as UserType);
        },
        onError: (error) => {
            toast.error((error as any).response?.data?.message || "Lấy thông tin người dùng thất bại. Vui lòng thử lại.", {
                duration: Infinity,
            })
        },
    });
}

export default useGetProfile

