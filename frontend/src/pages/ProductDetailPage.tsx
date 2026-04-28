import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Product, ProductImage } from '../features/products/types/product.type';
import Breadcrumb from '../features/products/components/Breadcrumb';
import ProductGallery from '../features/products/components/ProductGallery';
import ProductInfo from '../features/products/components/ProductInfo';
import ShippingInfo from '../features/products/components/ShippingInfo';
import ProductActions, { ActionButtons } from '../features/products/components/ProductActions';
import TrustBadges from '../features/products/components/TrustBadges';
import ShopProfile from '../features/products/components/ShopProfile';
import ProductDetails from '../features/products/components/ProductDetails';
import ProductReviews, { Review } from '../features/products/components/ProductReviews';
import ProductDetailLoader from '../features/products/components/ProductDetailLoader';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <ProductDetailLoader productId={id!}>
      {(product) => <ProductDetailContent product={product} navigate={navigate} />}
    </ProductDetailLoader>
  );
};

interface ProductDetailContentProps {
  product: Product;
  navigate: (path: string) => void;
}

const ProductDetailContent = ({ product, navigate }: ProductDetailContentProps) => {
  const currentUser = useAuthStore((s) => s.user);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);

  const priceValue = useMemo(() => parseFloat(product.price), [product.price]);
  const comparePriceValue = useMemo(
    () => (product.compare_price ? parseFloat(product.compare_price) : null),
    [product.compare_price],
  );
  const stockQuantity = useMemo(() => product.inventory?.quantity ?? 99, [product.inventory]);
  const averageRating = useMemo(() => product.averageRating ?? 0, [product.averageRating]);
  const totalRatings = useMemo(() => product.totalRatings ?? 0, [product.totalRatings]);

  // Map reviews từ product data
  useMemo(() => {
    if (product.ratings?.length) {
      const mapped: Review[] = product.ratings.map((r, i) => ({
        id: r.id || i,
        customer_name: r.user?.profile?.name || r.user?.email || 'Khách hàng',
        rating: r.rating,
        date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        comment: r.comment || '',
        is_verified: r.is_verified_purchase,
        title: r.title,
        helpful_count: r.helpful_count,
        has_reply: false,
      }));
      setReviews(mapped);
    }
  }, [product.ratings]);

  const mainImage = useMemo(() => {
    if (product.images?.length) {
      const primary = product.images.find((img: ProductImage) => img.is_primary);
      return primary?.image_url || product.images[0].image_url;
    }
    return `https://picsum.photos/seed/${product.id}/600/600`;
  }, [product]);

  const thumbnailImages = useMemo(() => {
    if (product.images?.length) return product.images.map((img: ProductImage) => img.image_url);
    return Array(5).fill(mainImage);
  }, [product.images, mainImage]);

  const handleAddToCart = () => {
    if (stockQuantity === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập!');
      navigate('/login');
      return;
    }
    if (stockQuantity === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    navigate('/checkout');
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stockQuantity)));
  };

  const handleReviewSubmitted = () => {
    // Refresh page to get new reviews after submission
    window.location.reload();
  };

  return (
    <div className='max-w-6xl mx-auto'>
      <Breadcrumb
        categoryName={product.category?.name}
        productName={product.name}
        onHomeClick={() => navigate('/')}
      />

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 mb-6'>
        <ProductGallery
          mainImage={mainImage}
          thumbnails={thumbnailImages}
          productName={product.name}
          liked={product?.liked}
        />

        <div className='md:w-7/12 flex flex-col'>
          <ProductInfo
            name={product.name}
            price={priceValue}
            comparePrice={comparePriceValue}
            averageRating={averageRating}
            totalRatings={totalRatings}
            soldCount={product.sold_count ?? 0}
            featured={product.featured}
          />

          <div className='flex items-center mb-6'>
            <span className='text-gray-500 text-sm w-24 shrink-0'>Mã Giảm Giá</span>
            <div className='flex gap-2'>
              <span className='bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-sm cursor-pointer hover:bg-green-100'>
                Giảm 10k
              </span>
              <span className='bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-sm cursor-pointer hover:bg-green-100'>
                Giảm 5%
              </span>
            </div>
          </div>

          <ShippingInfo transport_to={product.vendor?.address}  />

          <div className='flex items-center mb-4'>
            <span className='text-gray-500 text-sm w-24 shrink-0'>Màu sắc</span>
            <div className='flex gap-3'>
              {['Đen Nhám', 'Trắng Sứ'].map((color) => (
                <button
                  key={color}
                  className={`border-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    'border-gray-300 text-gray-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A]'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <ProductActions
            quantity={quantity}
            stock={stockQuantity}
            onQuantityChange={handleQuantityChange}
          />

          <ActionButtons
            stock={stockQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
          <TrustBadges />
        </div>
      </div>

      <ShopProfile
        vendorName={product.vendor?.store_name || 'TechShop VN'}
        logoUrl={product.vendor?.logo_url}
        description={product.vendor?.description}
        contactEmail={product.vendor?.contact_email}
        contactPhone={product.vendor?.contact_phone}
        address={product.vendor?.address}
        status={product.vendor?.status}
        createdAt={product.vendor?.createdAt}
      />

      <ProductDetails
        categoryName={product.category?.name}
        brand={product.attributes?.brand}
        stock={stockQuantity}
        sku={product.sku}
        description={product.description}
        shortDescription={product.short_description}
        dimensions={product.dimensions}
        weight={product.weight}
        tags={product.tags}
        status={product.status}
        visibility={product.visibility}
        allowBackorders={product.allow_backorders}
        soldIndividually={product.sold_individually}
        featured={product.featured}
      />

      <ProductReviews
        reviews={reviews}
        comments={product.comments}
        averageRating={averageRating}
        totalRatings={totalRatings}
        totalComments={product.totalComments ?? product.comments?.length ?? 0}
        productId={product.id}
        onReviewSubmitted={handleReviewSubmitted}
        onCommentSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ProductDetailPage;
