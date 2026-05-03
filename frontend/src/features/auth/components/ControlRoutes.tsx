import { useAuthStore } from '@/store/auth.store';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ControlRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ControlRoutes;
