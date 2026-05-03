import { Heart, Share2 } from 'lucide-react';

interface ProductGalleryProps {
  mainImage: string;
  thumbnails: string[];
  productName: string;
  liked: number | undefined;
}

const ProductGallery = ({ mainImage, thumbnails, productName, liked = 0 }: ProductGalleryProps) => (
  <div className='md:w-5/12 flex flex-col gap-4'>
    <div className='aspect-square rounded-xl border border-gray-200 overflow-hidden relative'>
      <img src={mainImage} className='w-full h-full object-cover' alt={productName} />
    </div>
    <div className='flex gap-2 overflow-x-auto'>
      {thumbnails.map((img, idx) => (
        <div
          key={idx}
          className={`w-20 h-20 rounded-lg border-2 cursor-pointer overflow-hidden shrink-0 transition-colors ${
            idx === 0 ? 'border-[#1E3A8A]' : 'border-transparent hover:border-[#1E3A8A]/50'
          }`}
        >
          <img
            src={img}
            className='w-full h-full object-cover opacity-80 hover:opacity-100'
            alt={`Thumbnail ${idx + 1}`}
          />
        </div>
      ))}
    </div>
    <div className='flex justify-center items-center text-gray-500 text-sm mt-2 gap-4'>
      <button className='flex items-center hover:text-pink-500 transition-colors'>
        <Heart className='h-4 w-4 mr-1' /> Đã thích ({liked})
      </button>
      <div className='w-px h-4 bg-gray-300'></div>
      <button className='flex items-center hover:text-[#1E3A8A] transition-colors'>
        <Share2 className='h-4 w-4 mr-1' /> Chia sẻ
      </button>
    </div>
  </div>
);

export default ProductGallery;
