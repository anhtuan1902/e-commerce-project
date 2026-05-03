import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import NavBar from './NavBar';

const Container = () => {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans'>
      {/* Header (Navbar) */}
      <NavBar />

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
