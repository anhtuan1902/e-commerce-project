import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getListCategories } from "../api/category.api";
import { useCategoriesStore } from "../store/categories.store";

const useCategories = () => {
    const setCategories = useCategoriesStore((s) => s.setCategories);
    return useMutation({
        mutationFn: getListCategories,
        onSuccess: (data) => {
            setCategories(Array.isArray(data.data) ? data.data : [data.data]);
        },
        onError: (error) => {
            setCategories([{ id: 0, name: 'Tất cả' }, { id: 1, name: 'Điện tử' }, { id: 2, name: 'Thời trang' }, { id: 3, name: 'Thực phẩm' }, { id: 4, name: 'Gia dụng' }]);
            toast.error((error as any).response?.data?.message || "Lấy thông tin người dùng thất bại. Vui lòng thử lại.", {
                duration: 3000,
            })
        },
    });
}

export default useCategories
