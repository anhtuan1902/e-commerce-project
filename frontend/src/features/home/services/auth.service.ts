import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/auth.types";
import api from "@/services/axios.config";
import { API_ROUTES } from "@/constants";


const AuthService = {
    // ── Đăng nhập ──────────────────────────────────────
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await api.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.LOGIN, data);
        return res.data.data;
    },

    // ── Đăng ký ────────────────────────────────────────
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const res = await api.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.REGISTER, data);
        return res.data.data;
    },

    // ── Đăng xuất ──────────────────────────────────────
    logout: async (refreshToken: string): Promise<void> => {
        await api.post(API_ROUTES.AUTH.LOGOUT, { refreshToken });
    },

    // ── Lấy thông tin user hiện tại ────────────────────
    getMe: async (): Promise<User> => {
        const res = await api.get<ApiResponse<User>>(API_ROUTES.AUTH.ME);
        return res.data.data;
    },

    // ── Làm mới token ──────────────────────────────────
    refreshToken: async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const res = await api.post(API_ROUTES.AUTH.REFRESH_TOKEN, { refreshToken: token });
        return res.data.data;
    },

    // ── Google OAuth ────────────────────────────────────
    // Redirect sang Google — không dùng axios
    loginWithGoogle: () => {
        window.location.href = `${import.meta.env.VITE_API_URL}${API_ROUTES.AUTH.GOOGLE}`;
    },
};

export default AuthService;