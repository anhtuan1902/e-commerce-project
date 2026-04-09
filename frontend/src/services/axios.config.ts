import { API_ROUTES } from '@/constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtService } from './jwt.services';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

// Gắn accessToken vào mỗi request
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động refresh token khi hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthUrl =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !original._retry && !isAuthUrl) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}${API_ROUTES.AUTH.REFRESH_TOKEN}`, {
          refreshToken: refreshToken,
        });

        Cookies.set('accessToken', response.data.data.accessToken);
        Cookies.set('refreshToken', response.data.data.refreshToken);
        const accessToken = response.data.data.accessToken || Cookies.get('accessToken');

        if (!accessToken) {
          throw new Error('No access token after refresh');
        }

        if (original.headers) {
          original.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(original);
      } catch (refreshError) {
        window.location.href = '/login';
        jwtService.removeTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
