import AuthService from '@/features/home/services/auth.service';
import { jwtService } from '@/services/jwt.services';
import { AuthState, LoginRequest, RegisterRequest, User } from '@/types/auth.types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// ── Async Thunks ──────────────────────────────────────

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (data: LoginRequest, { rejectWithValue }) => {
        try {
            const result = await AuthService.login(data);
            jwtService.setToken(result.accessToken);
            jwtService.setRefreshToken(result.refreshToken);
            return result;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
        }
    }
);

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            const result = await AuthService.register(data);
            jwtService.setToken(result.accessToken);
            jwtService.setRefreshToken(result.refreshToken);
            return result;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
        }
    }
);

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = Cookies.get('refreshToken');

            if (refreshToken) {
                await AuthService.logout(refreshToken);
                return true;
            }
            return false;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const getMeThunk = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            return await AuthService.getMe();
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Lỗi xác thực');
        }
    }
);


// ── Initial State ─────────────────────────────────────
const initialState: AuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    isLoading: false,
    error: null,
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
};

// ── Slice ─────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Dùng khi Google OAuth callback trả về token qua URL
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // ── Login ───────────────────────────────────────
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                localStorage.removeItem('isAuthenticated');
            });

        // ── Register ────────────────────────────────────
        builder
            .addCase(registerThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                localStorage.setItem('isAuthenticated', 'true');
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ── Logout ──────────────────────────────────────
        builder.addCase(logoutThunk.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            jwtService.removeTokens();
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
        });

        // ── Get Me ──────────────────────────────────────
        builder
            .addCase(getMeThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMeThunk.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
                state.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify(action.payload));
                localStorage.setItem('isAuthenticated', 'true');

            })
            .addCase(getMeThunk.rejected, (state) => {
                state.user = null;
                state.isLoading = false;
                state.isAuthenticated = false;
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user');
            });
    },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer; 
