import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SpinLoading from '../components/ui/SpinLoading';
import HomePage from '../features/home/pages/HomePage';
import LoginPage from '../features/home/pages/LoginPage';
import RegisterPage from '../features/home/pages/RegisterPage';
import { ROUTES } from '@/constants';
import { AuthCallbackPage } from '@/features/home/pages/AuthCallbackPage';
import { withPublicRoute } from './PublicRoute';
import Container from '@/components/layout/Container';
import ProfilePage from '@/features/home/pages/ProfilePage';

function AppRouter() {
  return (
    <Suspense fallback={<SpinLoading />}>
      <Routes>
        <Route
          element={<Container />}
          children={
            <>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              {/* Các route khác có layout chung (Container) sẽ được thêm ở đây */}
            </>
          }
        />
        <Route path={ROUTES.LOGIN} element={withPublicRoute(<LoginPage />)} />
        <Route path={ROUTES.REGISTER} element={withPublicRoute(<RegisterPage />)} />
        <Route path={ROUTES.CALLBACK_GOOGLE} element={<AuthCallbackPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
