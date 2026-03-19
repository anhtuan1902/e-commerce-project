import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';
import { store } from '@/store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Gắn accessToken vào mỗi request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động refresh token khi hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        if (store.getState().auth.user) {
          store.dispatch(
            setCredentials({ user: store.getState().auth.user!, accessToken: data.data.accessToken }),
          );
        }

        sessionStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        store.dispatch('auth/logout' as any);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
