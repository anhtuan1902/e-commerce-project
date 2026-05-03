import ControlRoutes from '@/features/auth/components/ControlRoutes';
import LoginForm from '@/features/auth/components/LoginForm';
import Header from '@/shared/layouts/Header';

const LoginPage = () => {
  return (
    <ControlRoutes>
      <Header />
      <LoginForm />
    </ControlRoutes>
  );
};

export default LoginPage;
