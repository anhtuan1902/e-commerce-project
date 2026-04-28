import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../ui/Logo';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import MobileSearchBar from './MobileSearchBar';
import MobileTopBar from './MobileTopBar';
import SearchBar from './SearchBar';

const NavBar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  };

  return (
    <nav className='bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-200 border-b border-gray-200 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-16 gap-2'>
          {/* Logo */}
          <Logo
            onLogoClick={() => {
              navigate('/');
            }}
          />

          {/* Desktop Search Bar */}
          <SearchBar onSearch={() => {}} />

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
            onCartClick={() => {}}
          />
        </div>

        {/* Mobile Search Bar */}
        <MobileSearchBar isOpen={isSearchOpen} onSearch={() => {}} />

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMenuOpen} onLoginClick={() => {}} onSignUpClick={() => {}} />
      </div>
    </nav>
  );
};

export default NavBar;
