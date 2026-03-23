import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import { JSX } from 'react';

const PublicRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Nếu đã login rồi thì redirect về home
  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return children;
};

// Helper function for more concise syntax
export const withPublicRoute = (element: JSX.Element): JSX.Element => (
  <PublicRoute>{element}</PublicRoute>
);
