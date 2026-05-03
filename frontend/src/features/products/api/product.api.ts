import api from "@/shared/services/axios.config";
import { ApiResponse } from "@/shared/types/global.types";
import { Product } from "../types/product.type";
import { API_ROUTES } from "@/shared/constants/routes.constants";

export interface SearchFilter {
  /** Field name to search (e.g. 'name', 'description', 'short_description') */
  field: string;
  /** Search value */
  value: string;
}

export interface PaginatedProductsResponse {
  data: Product[];
  total_items: number;
  total_pages: number;
}

export interface ProductApiResponse {
  data: Product[];
  pagination: {
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  success: boolean;
  message: string;
}

export interface GetProductsOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Search across multiple fields dynamically.
   * Format: [{ field: 'name', value: 'áo' }, { field: 'description', value: 'áo' }]
   * → backend builds: name LIKE %áo% OR description LIKE %áo% */
  search?: SearchFilter[];
  /** Plain text search — searches 'name' field only.
   * Ignored if `search` is also provided. */
  q?: string;
  /** Additional filters passed directly to WHERE clause
   * (e.g. { category_id: '1', vendor_id: '2' }) */
  [key: string]: unknown;
}

export const getProductById = async (id: string | number): Promise<Product> => {
  const res = await api.get<ApiResponse<Product>>(`${API_ROUTES.PRODUCTS}/${id}`);
  return res.data.data;
};

/**
 * Fetch paginated products.
 *
 * Search logic (matches backend queryBuilder):
 * - `search: [{ field: 'name', value: 'áo' }, { field: 'description', value: 'áo' }]`
 *   → name LIKE %áo% OR description LIKE %áo%
 *
 * - `q: 'áo'`  (plain text, field defaults to 'name')
 *   → name LIKE %áo%
 *
 * Any extra keys are forwarded directly as WHERE filters.
 */
export const getListProducts = async (
  options: GetProductsOptions = {}
): Promise<ProductApiResponse> => {
  const { page = 1, limit = 25, search, q, ...extra } = options;

  const params: Record<string, unknown> = { page, limit, ...extra };

  if (search && search.length > 0) {
    params.search = JSON.stringify({
      search_columns: search.map((f) => ({ [f.field]: f.value })),
    });
  } else if (q) {
    params.search = JSON.stringify({ search_columns: [{ name: q }] });
  }

  const res = await api.get<ApiResponse<PaginatedProductsResponse>>(
    API_ROUTES.PRODUCTS,
    { params }
  );

  return {
    data: res.data.data.data,
    pagination: {
      total: res.data.data.total_items,
      totalPages: res.data.data.total_pages,
      hasMore: res.data.data.total_items > page * limit,
    },
    success: res.data.success,
    message: res.data.message,
  };
};

/** Search-bar suggestions — name + price only */
export const getSearchSuggestions = async (q: string, limit = 8): Promise<Product[]> => {
  const searchParam = JSON.stringify({ search_columns: [{ name: q }] });
  const res = await api.get<ApiResponse<PaginatedProductsResponse>>(API_ROUTES.PRODUCTS, {
    params: { search: searchParam, page: 1, limit },
  });
  return res.data.data?.data ?? [];
};
