import { useEffect } from 'react';
import useProductDetail from '../hooks/useProductDetail';
import { useProductsStore } from '../store/products.store';
import { Loader2 } from 'lucide-react';
import { Product } from '../types/product.type';

interface ProductDetailLoaderProps {
  productId: string | number;
  children: (product: Product) => React.ReactNode;
}

const ProductDetailLoader = ({ productId, children }: ProductDetailLoaderProps) => {
  const { product, fetchProductDetail, isLoading } = useProductDetail();
  const setProduct = useProductsStore((s) => s.setProduct);

  useEffect(() => {
    fetchProductDetail(productId);
    return () => setProduct(null as any);
  }, [productId, fetchProductDetail]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-12 w-12 animate-spin text-' />
      </div>
    );
  }

  if (!product) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <p className='text-gray-500 mb-4'>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return <>{children(product)}</>;
};

export default ProductDetailLoader;
