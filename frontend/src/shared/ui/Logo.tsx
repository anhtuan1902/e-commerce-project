interface LogoProps {
  customClass?: string;
  onLogoClick?: () => void;
}

const Logo = ({ customClass, onLogoClick }: LogoProps) => {
  return (
    <div
      className='flex items-center cursor-pointer'
      onClick={onLogoClick || (() => console.log('Navigate to home'))}
    >
      <img
        src='../../../public/storeone_logo_lon.svg'
        alt='Logo'
        className={customClass || 'h-8 sm:h-10 md:h-12 lg:h-14 w-auto mr-1 sm:mr-2'}
      />
    </div>
  );
};

export default Logo;
