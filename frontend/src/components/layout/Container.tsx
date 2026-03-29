import { Outlet, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import NavBar from './NavBar';

const Container = () => {
  const navigate = useNavigate();

  const onLoginClick = () => {
    navigate('/login');
  };

  const onSignUpClick = () => {
    navigate('/register');
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200'>
      {/* Header (Navbar) */}
      <NavBar onLoginClick={onLoginClick} onSignUpClick={onSignUpClick} />

      {/* Main Content Area */}
      <main className='flex-row text-gray-900 dark:text-gray-50 m-8'>
        <Outlet />
      </main>

      {/* Footer */}
      {/* Ẩn Footer ở trang Vendor Dashboard vì nó có layout riêng (Sidebar + Content full màn) */}
      <Footer />
    </div>
  );
};

export default Container;
