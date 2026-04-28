import ControlRoutes from '@/features/auth/components/ControlRoutes';
import RegisterForm from '@/features/auth/components/RegisterForm';
import Header from '@/shared/layouts/Header';

const RegisterPage = () => {
  return (
    <ControlRoutes>
      <Header />
      <RegisterForm />
    </ControlRoutes>
  );
};

export default RegisterPage;
