import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const SearchBar = ({ placeholder = 'Tìm kiếm...', onSearch }: SearchBarProps) => {
  return (
    <div className='hidden sm:flex flex-1 max-w-xs sm:max-w-sm md:max-w-xl mx-2 sm:mx-4 md:mx-8'>
      <div className='relative w-full'>
        <input
          type='text'
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className='w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors duration-200'
        />
        <Search className='absolute left-2 sm:left-3 top-1.5 sm:top-2.5 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 dark:text-gray-500' />
      </div>
    </div>
  );
};

export default SearchBar;
