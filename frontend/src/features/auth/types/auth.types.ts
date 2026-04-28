export type UserRole = 'admin' | 'vendor' | 'customer';

export interface Profile {
    name: string;
    avatar: string;
    avatarUrl?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
}

export interface Vendor {
    id: string;
    store_name: string;
    logo_url?: string | null;
    description?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    address?: string | null;
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
    vendor?: Vendor;
    address?: string;
}


export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    store_name?: string; // Chỉ dành cho vendor
    role?: 'customer' | 'vendor';
}

export interface AuthLoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResponse {
    user: User;
    accessToken?: string;
    refreshToken?: string;
}