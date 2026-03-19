import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SpinLoading from '../components/ui/SpinLoading';
import HomePage from '../features/home/pages/HomePage';
import LoginPage from '../features/home/pages/LoginPage';
import RegisterPage from '../features/home/pages/RegisterPage';

function AppRouter() {
  return (
    <Suspense fallback={<SpinLoading />}>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
