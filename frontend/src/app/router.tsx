import { AuthCallbackPage } from '@/features/auth/components/AuthCallbackPage';
import { ProfilePage } from '@/features/profiles';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import RegisterPage from '@/pages/RegisterPage';
import { ROUTES } from '@/shared/constants/routes.constants';
import Container from '@/shared/layouts/Container';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SpinLoading from 'src/shared/ui/SpinLoading';

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
              <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
              {/* Các route khác có layout chung (Container) sẽ được thêm ở đây */}
            </>
          }
        />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.CALLBACK_GOOGLE} element={<AuthCallbackPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
