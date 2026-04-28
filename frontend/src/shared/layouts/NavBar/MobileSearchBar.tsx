import { Search } from 'lucide-react';

interface MobileSearchBarProps {
  isOpen: boolean;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const MobileSearchBar = ({
  isOpen,
  placeholder = 'Tìm kiếm...',
  onSearch,
}: MobileSearchBarProps) => {
  if (!isOpen) return null;

  return (
    <div className='sm:hidden border-t bg-white border-gray-200 px-2 py-2'>
      <div className='relative w-full'>
        <input
          type='text'
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className='w-full pl-8 pr-3 py-2 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        />
        <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
      </div>
    </div>
  );
};

export default MobileSearchBar;
