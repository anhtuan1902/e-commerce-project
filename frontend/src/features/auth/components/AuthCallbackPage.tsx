import SpinLoading from '@/shared/ui/SpinLoading';
import { useAuthCallback } from '../hooks/useAuthCallback';

export function AuthCallbackPage() {
  const { status, errorMsg } = useAuthCallback();

  if (status === 'error') {
    return (
      // center + gap
      <div className='callback-error flex flex-col items-center justify-center h-screen gap-4'>
        <p>Xác thực thất bại: {errorMsg}</p>
        <p>Đang chuyển về trang đăng nhập...</p>
      </div>
    );
  }

  // status === 'loading' | 'success'
  return (
    <div className='callback-loading flex flex-col items-center justify-center h-screen gap-4'>
      <SpinLoading />
      <p>Đang xác thực với Google...</p>
    </div>
  );
}
