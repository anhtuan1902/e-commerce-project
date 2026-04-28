import { useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';
import NavBar from './NavBar';
import Footer from './Footer';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideFooter =
    location.pathname === ROUTES.VENDOR || location.pathname.startsWith(`${ROUTES.VENDOR}/`);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200'>
      {/* Header (Navbar) */}
      <NavBar />

      {/* Main Content Area */}
      <main className='flex-row text-gray-900 dark:text-gray-50'>{children}</main>

      {/* Footer */}
      {/* Ẩn Footer ở trang Vendor Dashboard vì nó có layout riêng (Sidebar + Content full màn) */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
