export interface ProductImage {
    id: number;
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
}

export interface ProductInventory {
    quantity: number;
    track_inventory: boolean;
    low_stock_threshold: number;
}

export interface ProductRating {
    id?: number;
    rating: number;
    user_id?: number;
    comment?: string;
    title?: string;
    is_verified_purchase?: boolean;
    helpful_count?: number;
    createdAt?: string;
    user?: {
        id?: number;
        email?: string;
        profile?: {
            name?: string;
            avatar?: string;
        };
    };
}

export interface ProductComment {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    helpful_count: number;
    user?: {
        id?: number;
        profile?: {
            name?: string;
            avatar?: string;
        };
    };
    replies?: ProductComment[];
}

export interface ProductVendor {
    id: number;
    store_name: string;
    logo_url?: string;
    description?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    status?: 'pending' | 'active' | 'suspended' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
}

export interface Product {
    id: number;
    vendor_id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    sku: string;
    price: string;
    compare_price: string | null;
    cost_price: string;
    weight: string;
    dimensions: {
        width: number;
        height: number;
        length: number;
    };
    tags: string[];
    attributes: Record<string, string>;
    status: 'active' | 'inactive' | 'draft' | 'archived';
    visibility: 'public' | 'private' | 'hidden';
    stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
    allow_backorders: boolean;
    sold_individually: boolean;
    featured: boolean;
    seo_title: string;
    seo_description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    images?: ProductImage[];
    inventory?: ProductInventory;
    category?: ProductCategory;
    vendor?: ProductVendor;
    ratings?: ProductRating[];
    comments?: ProductComment[];
    totalComments?: number;
    averageRating?: number;
    totalRatings?: number;
    sold_count?: number;
    liked?: number;
}

export interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    isLoading: boolean;
}

export interface ProductState {
    products: Product[];
    currentProduct: Product | null;
    pagination: PaginationState;
}

export interface ProductStore extends ProductState {
    selectedCategoryId: string | null;
    setProducts: (products: Product[]) => void;
    setProductsWithPagination: (products: Product[], pagination: Omit<PaginationState, 'isLoading'>) => void;
    setProduct: (product: Product) => void;
    appendProducts: (products: Product[], pagination: Omit<PaginationState, 'isLoading'>) => void;
    setLoading: (isLoading: boolean) => void;
    resetProducts: () => void;
    setSelectedCategoryId: (categoryId: string | null) => void;
}