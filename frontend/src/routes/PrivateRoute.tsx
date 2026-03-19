import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { JSX } from 'react';

const PrivateRoute = ({ children, roles }: { children: JSX.Element; roles: string[] }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return <Navigate to='/login' replace />;
  if (!roles.includes(user.role)) return <Navigate to='/' replace />;
  return children;
};

export default PrivateRoute;
