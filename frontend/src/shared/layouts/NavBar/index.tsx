import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../ui/Logo';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import MobileSearchBar from './MobileSearchBar';
import MobileTopBar from './MobileTopBar';
import SearchBar from './SearchBar';
import { useProductsStore } from '@/features/products/store/products.store';

const NavBar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const setSearchQuery = useProductsStore((s) => s.setSearchQuery);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className='bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-16 gap-2'>
          {/* Logo */}
          <Logo
            onLogoClick={() => {
              navigate('/');
            }}
          />

          {/* Desktop Search Bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Desktop Navigation Menu */}
          <DesktopMenu />

          {/* Theme Toggle */}
          {/* <ThemeToggle className='hidden sm:flex' /> */}

          {/* Mobile Top Bar (Icons) */}
          <MobileTopBar
            isSearchOpen={isSearchOpen}
            isMenuOpen={isMenuOpen}
            onSearchToggle={handleSearchToggle}
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* Mobile Search Bar */}
        <MobileSearchBar isOpen={isSearchOpen} onSearch={handleSearch} />

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMenuOpen} onLoginClick={() => {}} onSignUpClick={() => {}} />
      </div>
    </nav>
  );
};

export default NavBar;
