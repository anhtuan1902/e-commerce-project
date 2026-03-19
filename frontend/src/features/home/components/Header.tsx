import { useNavigate } from 'react-router-dom';
import Logo from '../../../components/ui/Logo';

const Header = () => {
  const navigate = useNavigate();

  const onLogoClick = () => {
    navigate('/');
  };

  return (
    <>
      <nav className='bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-200 border-b border-gray-200 dark:border-gray-800'>
        <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-16 gap-2'>
            <Logo onLogoClick={onLogoClick} />

            <div className='text-gray-900 dark:text-gray-50 text-xs lg:text-sm font-medium'>
              bạn cần giúp đỡ?
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
