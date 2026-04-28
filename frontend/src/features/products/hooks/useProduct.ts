import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getListProducts } from "../api/product.api";
import { useProductsStore } from "../store/products.store";
import { useCallback } from "react";

const useProduct = () => {
    const setProductsWithPagination = useProductsStore((s) => s.setProductsWithPagination);
    const appendProducts = useProductsStore((s) => s.appendProducts);
    const pagination = useProductsStore((s) => s.pagination);
    const setLoading = useProductsStore((s) => s.setLoading);
    const selectedCategoryId = useProductsStore((s) => s.selectedCategoryId);

    const fetchInitialProducts = useMutation({
        mutationFn: () => getListProducts(1, 25, selectedCategoryId || undefined),
        onSuccess: (data) => {
            setProductsWithPagination(data.data, {
                page: 1,
                limit: 25,
                ...data.pagination,
            });
        },
        onError: (error) => {
            toast.error((error as any).response?.data?.message || "Lấy thông tin người dùng thất bại. Vui lòng thử lại.", {
                duration: Infinity,
            });
        },
    });

    const fetchMoreProducts = useMutation({
        mutationFn: () => getListProducts(pagination.page + 1, pagination.limit, selectedCategoryId || undefined),
        onSuccess: (data) => {
            appendProducts(data.data, {
                page: pagination.page + 1,
                limit: pagination.limit,
                ...data.pagination,
            });
        },
        onError: (error) => {
            toast.error((error as any).response?.data?.message || "Tải thêm sản phẩm thất bại.", {
                duration: 3000,
            });
        },
        onSettled: () => {
            setLoading(false);
        },
    });

    const loadMore = useCallback(() => {
        if (!pagination.hasMore || pagination.isLoading) return;
        setLoading(true);
        fetchMoreProducts.mutate();
    }, [pagination.hasMore, pagination.isLoading, fetchMoreProducts, setLoading]);

    return {
        fetchProducts: fetchInitialProducts.mutate,
        fetchMore: loadMore,
        isLoadingInitial: fetchInitialProducts.isPending,
        isLoadingMore: pagination.isLoading,
        hasMore: pagination.hasMore,
    };
};

export default useProduct;