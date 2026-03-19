export type UserRole = 'admin' | 'vendor' | 'customer';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    address?: string;
    is_verified: boolean;
    last_login_at: Date;
    created_at: Date;
    updated_at: Date;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

// ── Request types ─────────────────────────────────────
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    store_name?: string; // Chỉ dành cho vendor
    role?: 'customer' | 'vendor';
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// ── Response types ────────────────────────────────────
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
