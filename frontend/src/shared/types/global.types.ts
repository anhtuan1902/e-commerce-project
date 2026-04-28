
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type UserRole = 'admin' | 'vendor' | 'customer';

export interface Profile {
    name: string;
    avatar: string;
    avatarUrl?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
}

export interface UserType {
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
