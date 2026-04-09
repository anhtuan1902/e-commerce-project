import { useAppDispatch } from '@/hooks';
import { jwtService } from '@/services/jwt.services';
import { getMeThunk } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
type Status = 'loading' | 'success' | 'error';

export function useAuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<Status>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        handleCallback();
    }, []);

    async function handleCallback() {
        try {
            // 1. Đọc token từ URL
            const error = searchParams.get('error');

            // 2. Xử lý lỗi từ backend
            if (error) throw new Error(error);


            // 3. Luu token với cookie
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');

            if (accessToken && refreshToken) {
                jwtService.setToken(accessToken);
                jwtService.setRefreshToken(refreshToken);
            }


            // 4. Lấy thông tin user (nếu cần)
            await dispatch(getMeThunk()).unwrap();

            setStatus('success');

            // 5. Redirect — replace: true để back button không về /auth/callback
            navigate('/', { replace: true });

        } catch (err) {
            setStatus('error');
            const msg = err instanceof Error ? err.message : 'unknown';
            setErrorMsg(msg);

            // // Redirect về login kèm error sau 2s
            setTimeout(() => {
                navigate(`/login?error=${msg}`, { replace: true });
            }, 2000);
        }
    }

    return { status, errorMsg };
}