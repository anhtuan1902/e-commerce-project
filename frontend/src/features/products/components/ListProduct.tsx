import { ShoppingCart, Loader2 } from 'lucide-react';
import useProduct from '../hooks/useProduct';
import { useEffect, memo } from 'react';
import { useProductsStore } from '../store/products.store';
import { Product } from '../types/product.type';
import InfiniteScroll from 'react-infinite-scroll-component';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes.constants';

const ProductCard = memo(
  ({
    product,
    onAddToCart,
    navigate,
  }: {
    product: Product;
    onAddToCart: (e: React.MouseEvent) => void;
    navigate: NavigateFunction;
  }) => (
    <div
      className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group'
      onClick={() =>
        navigate(ROUTES.PRODUCT_DETAIL.replace(':id', product.id.toString()), {
          state: {
            product,
          },
        })
      }
    >
      <div className='h-48 overflow-hidden bg-gray-100'>
        <img
          src={`https://picsum.photos/seed/${product.id}/300/300`}
          alt={product.name}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          loading='lazy'
        />
      </div>
      <div className='p-4'>
        <span className='text-xs text-[#1E3A8A] font-semibold uppercase tracking-wider'>
          {product.attributes?.brand || 'No Brand'}
        </span>
        <h3 className='text-gray-900 font-medium mt-1 mb-2 line-clamp-2'>{product.name}</h3>
        <div className='flex justify-between items-center mt-4'>
          <span className='text-lg font-bold text-gray-900'>
            ${Number(product.price).toLocaleString()}
          </span>
          <button
            className='bg-indigo-50 text-[#1E3A8A] p-2 rounded-lg hover:bg-indigo-100 transition-colors'
            onClick={onAddToCart}
          >
            <ShoppingCart className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  ),
);

ProductCard.displayName = 'ProductCard';

const ListProduct = () => {
  const navigate = useNavigate();
  const { fetchProducts, fetchMore, isLoadingInitial, hasMore } = useProduct();
  const products = useProductsStore((s) => s.products);
  const selectedCategoryId = useProductsStore((s) => s.selectedCategoryId);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryId, fetchProducts]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert('Đã thêm vào giỏ hàng');
  };

  return (
    <>
      <h2 className='text-xl font-bold text-gray-900 my-3'>Sản phẩm nổi bật</h2>
      {isLoadingInitial ? (
        <div className='flex justify-center items-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-[#1E3A8A]' />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={products.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <div className='flex justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-[#1E3A8A]' />
            </div>
          }
          endMessage={
            <div className='flex justify-center text-center py-8 items-center'>
              <span className='text-gray-500 text-sm'>Đã hiển thị tất cả sản phẩm</span>
            </div>
          }
          scrollableTarget='product-scroll-container'
          className={`${products.length > 0 ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : ''}`}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              navigate={navigate}
            />
          ))}
        </InfiniteScroll>
      )}
    </>
  );
};

export default ListProduct;
