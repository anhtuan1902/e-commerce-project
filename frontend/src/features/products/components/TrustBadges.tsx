import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const TrustBadges = () => (
  <div className='flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500'>
    <div className='flex items-center'>
      <RotateCcw className='h-4 w-4 mr-1 text-red-500' /> 7 ngày miễn phí trả hàng
    </div>
    <div className='flex items-center'>
      <ShieldCheck className='h-4 w-4 mr-1 text-blue-500' /> Hàng chính hãng 100%
    </div>
    <div className='flex items-center'>
      <Truck className='h-4 w-4 mr-1 text-teal-500' /> Miễn phí vận chuyển
    </div>
  </div>
);

export default TrustBadges;
