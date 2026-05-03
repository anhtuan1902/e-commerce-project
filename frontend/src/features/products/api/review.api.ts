import api from "@/shared/services/axios.config";
import { ApiResponse } from "@/shared/types/global.types";
import { API_ROUTES } from "@/shared/constants/routes.constants";

export interface ReviewResponse {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment: string;
    title?: string;
    is_verified_purchase?: boolean;
    helpful_count?: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        email: string;
        profile?: {
            name: string;
            avatar?: string;
        };
    };
    product?: {
        id: number;
        name: string;
    };
}

export interface CreateReviewPayload {
    product_id: number;
    rating: number;
    comment: string;
}

export interface GetReviewsResponse {
    data: ReviewResponse[];
    total_items: number;
    total_pages: number;
    average_rating: number;
    total_reviews: number;
}

export const getProductReviews = async (
    productId: number,
    page = 1,
    limit = 10
): Promise<GetReviewsResponse> => {
    const res = await api.get<ApiResponse<GetReviewsResponse>>(
        `${API_ROUTES.PRODUCTS}/${productId}${API_ROUTES.REVIEWS}`,
        { params: { page, limit } }
    );
    return res.data.data;
};

export const createProductReview = async (
    payload: CreateReviewPayload
): Promise<ReviewResponse> => {
    const res = await api.post<ApiResponse<ReviewResponse>>(
        API_ROUTES.REVIEWS,
        payload
    );
    return res.data.data;
};

export const updateProductReview = async (
    reviewId: number,
    payload: Partial<CreateReviewPayload>
): Promise<ReviewResponse> => {
    const res = await api.put<ApiResponse<ReviewResponse>>(
        `${API_ROUTES.REVIEWS}/${reviewId}`,
        payload
    );
    return res.data.data;
};

export const deleteProductReview = async (reviewId: number): Promise<void> => {
    await api.delete(`${API_ROUTES.REVIEWS}/${reviewId}`);
};
