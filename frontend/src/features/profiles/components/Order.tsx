import { ClipboardList } from 'lucide-react';

interface OrderItem {
  id: number;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}

interface OrderProps {
  orders?: OrderItem[];
}

const getStatusColor = (status: OrderItem['status']) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status];
};

const getStatusLabel = (status: OrderItem['status']) => {
  const labels = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
  };
  return labels[status];
};

const Order = ({ orders = [] }: OrderProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Đơn hàng của tôi</h2>
        <p className='text-gray-500'>Xem và theo dõi các đơn hàng của bạn</p>
      </div>

      {orders.length === 0 ? (
        <div className='text-center py-12'>
          <ClipboardList className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có đơn hàng nào</h3>
          <p className='text-gray-500'>Bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {orders.map((order) => (
            <div
              key={order.id}
              className='bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#1E3A8A] transition-colors cursor-pointer'
            >
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <p className='font-semibold text-gray-900'>#{order.orderNumber}</p>
                  <p className='text-sm text-gray-500'>{formatDate(order.date)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <p className='text-sm text-gray-600'>{order.items} sản phẩm</p>
                <p className='font-bold text-[#1E3A8A]'>{formatPrice(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
