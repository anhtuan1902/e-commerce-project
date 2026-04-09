export const ROLES = {
    ADMIN: 'admin',
    VENDOR: 'vendor',
    CUSTOMER: 'customer',
} as const;

export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        GOOGLE: '/auth/google',
        REFRESH_TOKEN: '/auth/refresh-token',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
    },
    PROFILE: {
        UPDATE: '/profile/me',
    },
    PRODUCTS: '/products',
    ORDERS: '/orders',
    VENDORS: '/vendors',
} as const;

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    CALLBACK_GOOGLE: '/auth/callback',
    PROFILE: '/profile',
}

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

export const DEFAULT_EXPIRATION_TIME_TOKEN = 60 * 60 * 1000; // 1 giờ

export const DEFAULT_EXPIRATION_TIME_REFRESH_TOKEN = 7 * 24 * 60 * 60 * 1000; // 7 ngày