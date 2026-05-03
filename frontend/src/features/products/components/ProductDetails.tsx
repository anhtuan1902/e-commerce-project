interface ProductDetailsProps {
  categoryName?: string;
  brand?: string;
  stock: number;
  sku?: string;
  description?: string;
  shortDescription?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'draft' | 'archived';
  visibility?: 'public' | 'private' | 'hidden';
  allowBackorders?: boolean;
  soldIndividually?: boolean;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'active': return 'Đang bán';
    case 'inactive': return 'Ngừng bán';
    case 'draft': return 'Nháp';
    case 'archived': return 'Lưu trữ';
    default: return 'N/A';
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'active': return 'text-green-600';
    case 'inactive': return 'text-gray-500';
    case 'draft': return 'text-yellow-600';
    case 'archived': return 'text-gray-400';
    default: return 'text-gray-500';
  }
};

const getVisibilityLabel = (visibility?: string) => {
  switch (visibility) {
    case 'public': return 'Công khai';
    case 'private': return 'Riêng tư';
    case 'hidden': return 'Ẩn';
    default: return 'N/A';
  }
};

const ProductDetails = ({
  categoryName,
  brand,
  stock,
  sku,
  description,
  shortDescription,
  dimensions,
  weight,
  tags,
  status,
  visibility,
  allowBackorders,
  soldIndividually,
  featured,
}: ProductDetailsProps) => (
  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
    <h2 className='text-lg font-bold text-gray-900 mb-6 p-4 bg-gray-50 rounded-lg'>
      CHI TIẾT SẢN PHẨM
    </h2>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm px-4'>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Danh Mục</span>
        <span className='font-medium text-[#1E3A8A] cursor-pointer'>{categoryName || 'N/A'}</span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Thương hiệu</span>
        <span className='font-medium text-gray-900'>{brand || 'N/A'}</span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Kho hàng</span>
        <span className={`font-medium ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {stock > 0 ? `${stock} sản phẩm` : 'Hết hàng'}
        </span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Trạng thái</span>
        <span className={`font-medium ${getStatusColor(status)}`}>{getStatusLabel(status)}</span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>SKU</span>
        <span className='font-medium text-gray-900'>{sku || 'N/A'}</span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Tầm nhìn</span>
        <span className='font-medium text-gray-900'>{getVisibilityLabel(visibility)}</span>
      </div>
      {weight && (
        <div className='flex'>
          <span className='w-32 text-gray-500 shrink-0'>Trọng lượng</span>
          <span className='font-medium text-gray-900'>{weight} kg</span>
        </div>
      )}
      {dimensions && (
        <div className='flex'>
          <span className='w-32 text-gray-500 shrink-0'>Kích thước</span>
          <span className='font-medium text-gray-900'>
            {dimensions.length && dimensions.width && dimensions.height
              ? `${dimensions.length} x ${dimensions.width} x ${dimensions.height} cm`
              : 'N/A'}
          </span>
        </div>
      )}
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Cho phép đặt trước</span>
        <span className='font-medium text-gray-900'>{allowBackorders ? 'Có' : 'Không'}</span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Bán riêng lẻ</span>
        <span className='font-medium text-gray-900'>{soldIndividually ? 'Có' : 'Không'}</span>
      </div>
      <div className='flex'>
        <span className='w-32 text-gray-500 shrink-0'>Sản phẩm nổi bật</span>
        <span className='font-medium text-gray-900'>{featured ? 'Có' : 'Không'}</span>
      </div>
      {tags && tags.length > 0 && (
        <div className='flex col-span-1 md:col-span-2'>
          <span className='w-32 text-gray-500 shrink-0'>Tags</span>
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag, idx) => (
              <span key={idx} className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded'>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    <h2 className='text-lg font-bold text-gray-900 mb-4 p-4 bg-gray-50 rounded-lg'>
      MÔ TẢ SẢN PHẨM
    </h2>
    <div className='px-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line'>
      {description || 'Không có mô tả sản phẩm.'}
      {shortDescription && (
        <>
          {'\n\n'}
          {shortDescription}
        </>
      )}
    </div>
  </div>
);

export default ProductDetails;
