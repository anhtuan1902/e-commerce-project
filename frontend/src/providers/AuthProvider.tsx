import SpinLoading from '@/components/ui/SpinLoading';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { getMeThunk } from '@/store/slices/authSlice';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMeThunk());
    }
  }, []);

  if (isLoading) {
    return <SpinLoading />;
  }

  return (
    <>
      {children}
      <Toaster position='top-center' />
    </>
  );
}
