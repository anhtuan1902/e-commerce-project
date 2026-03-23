import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SpinLoading from '../components/ui/SpinLoading';
import HomePage from '../features/home/pages/HomePage';
import LoginPage from '../features/home/pages/LoginPage';
import RegisterPage from '../features/home/pages/RegisterPage';
import { ROUTES } from '@/constants';
import { AuthCallbackPage } from '@/features/home/pages/AuthCallbackPage';
import { withPublicRoute } from './PublicRoute';

function AppRouter() {
  return (
    <Suspense fallback={<SpinLoading />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.LOGIN} element={withPublicRoute(<LoginPage />)} />
        <Route path={ROUTES.REGISTER} element={withPublicRoute(<RegisterPage />)} />
        <Route path={ROUTES.CALLBACK_GOOGLE} element={<AuthCallbackPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
