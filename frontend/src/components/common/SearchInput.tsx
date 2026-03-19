import { Search } from 'lucide-react';

const SearchInput = ({}) => {
  return (
    <div className='relative w-full'>
      <input
        ref={searchInputRef}
        type='text'
        placeholder='Tìm kiếm...'
        className='w-full pl-8 pr-3 py-2 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
      />
      <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
    </div>
  );
};

export default SearchInput;
