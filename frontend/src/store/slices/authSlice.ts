import AuthService from '@/features/home/services/auth.service';
import { AuthState, LoginRequest, RegisterRequest, User } from '@/types/auth.types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Async Thunks ──────────────────────────────────────

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (data: LoginRequest, { rejectWithValue }) => {
        try {
            const result = await AuthService.login(data);
            // Lưu refreshToken vào cookie
            sessionStorage.setItem('refreshToken', result.refreshToken);
            sessionStorage.setItem('accessToken', result.accessToken);
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
            localStorage.setItem('refreshToken', result.refreshToken);
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
            const refreshToken = sessionStorage.getItem('refreshToken') || '';
            await AuthService.logout(refreshToken);
        } catch {
            // Dù lỗi vẫn logout ở client
        } finally {
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
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
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
};

// ── Slice ─────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Dùng khi Google OAuth callback trả về token qua URL
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('accessToken', action.payload.accessToken);
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
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                localStorage.setItem('accessToken', action.payload.accessToken);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
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
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                localStorage.setItem('accessToken', action.payload.accessToken);
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ── Logout ──────────────────────────────────────
        builder.addCase(logoutThunk.fulfilled, (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.error = null;
        });

        // ── Get Me ──────────────────────────────────────
        builder
            .addCase(getMeThunk.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getMeThunk.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            });
    },
});

export const { setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
