import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProductById } from "../api/product.api";
import { useProductsStore } from "../store/products.store";

const useProductDetail = () => {
    const setProduct = useProductsStore((s) => s.setProduct);
    const currentProduct = useProductsStore((s) => s.currentProduct);

    const fetchProductDetail = useMutation({
        mutationFn: (id: string | number) => getProductById(id),
        onSuccess: (data) => {
            setProduct(data);
        },
        onError: (error) => {
            toast.error(
                (error as any).response?.data?.message || "Lấy thông tin sản phẩm thất bại. Vui lòng thử lại.",
                { duration: 3000 }
            );
        },
    });

    return {
        product: currentProduct,
        fetchProductDetail: fetchProductDetail.mutate,
        isLoading: fetchProductDetail.isPending,
        isError: fetchProductDetail.isError,
    };
};

export default useProductDetail;
