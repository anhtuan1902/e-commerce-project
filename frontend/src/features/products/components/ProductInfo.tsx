import { ShieldCheck } from 'lucide-react';
import StarRating from './StarRating';

interface ProductInfoProps {
  name: string;
  price: number;
  comparePrice: number | null;
  averageRating: number;
  totalRatings: number;
  soldCount?: number;
  featured?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductInfo = ({
  name,
  price,
  comparePrice,
  averageRating,
  totalRatings,
  soldCount = 0,
  featured = false,
}: ProductInfoProps) => {
  const discountPercentage =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return (
    <div className='md:w-7/12 flex flex-col'>
      <div className='flex items-center space-x-2 mb-2'>
        {featured && (
          <span className='bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider'>
            Yêu thích+
          </span>
        )}
        <span className='bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center'>
          <ShieldCheck className='h-3 w-3 mr-1' /> Mall
        </span>
      </div>

      <h1 className='text-2xl font-medium text-gray-900 mb-3 leading-snug'>{name}</h1>

      <div className='flex items-center mb-4 text-sm divide-x divide-gray-300'>
        <div className='flex items-center text-amber-500 pr-4'>
          <span className='font-bold underline mr-1'>{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} size='md' />
        </div>
        <div className='px-4 text-gray-600'>
          <span className='font-bold underline text-gray-900'>{totalRatings.toLocaleString()}</span>{' '}
          Đánh Giá
        </div>
        <div className='pl-4 text-gray-600'>
          <span className='font-bold text-gray-900'>
            {soldCount > 1000 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount}
          </span>{' '}
          Đã Bán
        </div>
      </div>

      <div className='rounded-xl mb-6'>
        {comparePrice && comparePrice > price && (
          <div className='text-gray-400 line-through mb-1'>{formatPrice(comparePrice)}</div>
        )}
        <div className='flex items-center gap-4'>
          <span className='text-3xl font-extrabold text-[#1E3A8A]'>{formatPrice(price)}</span>
          {discountPercentage > 0 && (
            <span className='bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase'>
              Giảm {discountPercentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
