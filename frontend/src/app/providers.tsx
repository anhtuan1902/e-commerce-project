import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useGetProfile from 'src/features/auth/hooks/useGetProfile';
import SpinLoading from 'src/shared/ui/SpinLoading';
import { useAuthStore } from 'src/store/auth.store';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { mutate, isPending } = useGetProfile();

  useEffect(() => {
    if (isAuthenticated) {
      mutate();
    }
  }, [isAuthenticated, mutate]);

  return (
    <>
      {children}
      {isPending && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <SpinLoading />
        </div>
      )}
      <Toaster position='top-center' toastOptions={{ duration: 5000 }} />
    </>
  );
};
