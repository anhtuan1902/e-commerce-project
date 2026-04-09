export type UserRole = 'admin' | 'vendor' | 'customer';

export interface Profile {
    name: string;
    avatar: string;
    avatarUrl?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
}

export interface User {
    id: number;
    email: string;
    role: UserRole;
    is_verified: boolean;
    last_login_at: Date;
    no_password: boolean;
    created_at: Date;
    updated_at: Date;
    profile?: Profile;
    address?: object[];
}

export interface AuthState {
    user: User | null;
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
    confirm_password: string;
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
