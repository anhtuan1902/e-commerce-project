import { Truck, MapPin } from 'lucide-react';

interface ShippingInfoProps {
  transport_to?: string;
}

const ShippingInfo = ({ transport_to }: ShippingInfoProps) => {
  return (
    <div className='flex items-start mb-6'>
      <span className='text-gray-500 text-sm w-24 shrink-0'>Vận Chuyển</span>
      <div>
        <div className='flex items-center mb-2'>
          <Truck className='h-5 w-5 text-teal-500 mr-2' />
          <span className='text-sm font-medium'>Miễn phí vận chuyển</span>
        </div>
        <div className='flex items-center text-sm text-gray-600'>
          <MapPin className='h-4 w-4 text-gray-400 mr-2' />
          Vận chuyển từ: <span className='font-medium text-gray-900 ml-1'>{transport_to || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
