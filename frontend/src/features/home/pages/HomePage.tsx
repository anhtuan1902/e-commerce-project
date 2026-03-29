import { ShoppingCart } from 'lucide-react';
import Container from '../../../components/layout/Container';
import Banner from '../components/Banner';

const HomePage = () => {
  const categories = ['Tất cả', 'Điện tử', 'Thời trang', 'Thực phẩm', 'Gia dụng'];
  const MOCK_PRODUCTS = [
    {
      id: 1,
      name: 'Tai nghe Chống ồn Không dây Sony WH-1000XM5',
      price: 299.99,
      vendor: 'TechShop VN',
      rating: 4.8,
      reviews: 124,
      image:
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Điện tử',
    },
    {
      id: 2,
      name: 'Balo Da Nữ Phong Cách Hàn Quốc',
      price: 45.0,
      vendor: 'Boutique Fashion',
      rating: 4.5,
      reviews: 89,
      image:
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Thời trang',
    },
    {
      id: 3,
      name: 'Cà phê Hạt Arabica Nguyên Chất 1kg',
      price: 18.5,
      vendor: 'Dalat Coffee Roasters',
      rating: 4.9,
      reviews: 312,
      image:
        'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Thực phẩm',
    },
    {
      id: 4,
      name: 'Đèn Bàn Chống Cận Thị Thông Minh',
      price: 32.0,
      vendor: 'TechShop VN',
      rating: 4.2,
      reviews: 56,
      image:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=300&h=300',
      category: 'Gia dụng',
    },
  ];
  return (
    <>
      <Banner />
      <div className='flex space-x-4 overflow-x-auto pb-4 mb-6 scrollbar-hide'>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            type='button'
            onClick={() => console.log(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border ${idx === 0 ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className='text-xl font-bold text-gray-900 mb-6'>Sản phẩm nổi bật</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group'
            onClick={() => {
              console.log(product);
            }}
          >
            <div className='h-48 overflow-hidden'>
              <img
                src={product.image}
                alt={product.name}
                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
              />
            </div>
            <div className='p-4'>
              <span className='text-xs text-[#1E3A8A] font-semibold uppercase tracking-wider'>
                {product.category}
              </span>
              <h3 className='text-gray-900 font-medium mt-1 mb-2 line-clamp-2'>{product.name}</h3>
              <div className='flex justify-between items-center mt-4'>
                <span className='text-lg font-bold text-gray-900'>${product.price.toFixed(2)}</span>
                <button
                  className='bg-indigo-50 text-[#1E3A8A] p-2 rounded-lg hover:bg-indigo-100 transition-colors'
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Đã thêm vào giỏ hàng');
                  }}
                >
                  <ShoppingCart className='h-5 w-5' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default HomePage;
