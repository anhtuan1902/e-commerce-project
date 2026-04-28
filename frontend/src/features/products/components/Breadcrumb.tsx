import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  categoryName?: string;
  productName: string;
  onHomeClick: () => void;
}

const Breadcrumb = ({ categoryName, productName, onHomeClick }: BreadcrumbProps) => (
  <nav className='flex text-sm text-gray-500 mb-6 items-center'>
    <button onClick={onHomeClick} className='hover:text-[#1E3A8A] font-medium'>
      Trang chủ
    </button>
    <ChevronRight className='h-4 w-4 mx-1' />
    <span className='hover:text-[#1E3A8A] cursor-pointer'>{categoryName || 'Danh mục'}</span>
    <ChevronRight className='h-4 w-4 mx-1' />
    <span className='text-gray-900 truncate max-w-xs'>{productName}</span>
  </nav>
);

export default Breadcrumb;
