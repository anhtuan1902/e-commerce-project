const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    CALLBACK_GOOGLE: '/auth/callback',
    PROFILE: '/profile',
    VENDOR: '/vendor',
    ADMIN: '/admin',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    CART: '/cart',
}

const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        GOOGLE: '/auth/google',
        REFRESH_TOKEN: '/auth/refresh-token',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
    },
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    REVIEWS: '/reviews',
}

export { ROUTES, API_ROUTES };