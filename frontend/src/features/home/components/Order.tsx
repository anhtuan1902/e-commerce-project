import { ChevronRight, Package } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Order = ({ orders }: { orders: any[] }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-4'>Lịch sử đơn hàng</h2>
      {/* croll when too long */}
      <div className='space-y-4 max-h-[500px] overflow-y-auto'>
        {orders?.map((order) => (
          <div
            key={order.id}
            className='bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow'
          >
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4'>
              <div>
                <span className='font-bold text-[#1E3A8A]'>{order.id}</span>
                <span className='text-gray-500 text-sm ml-3'>Đặt ngày: {order.date}</span>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Đã giao hàng'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'Đang giao'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className='flex justify-between items-center pt-4 border-t border-gray-100'>
              <div className='text-sm text-gray-600'>
                Tổng tiền:{' '}
                <span className='font-bold text-gray-900 text-lg ml-1'>
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <button className='text-[#1E3A8A] font-medium text-sm hover:text-indigo-800 flex items-center'>
                Xem chi tiết <ChevronRight className='h-4 w-4 ml-1' />
              </button>
            </div>
          </div>
        ))}

        {/* Empty state nếu không có đơn hàng */}
        {[]?.length === 0 && (
          <div className='text-center py-12'>
            <Package className='h-12 w-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-500'>Bạn chưa có đơn hàng nào.</p>
            <button
              onClick={() => navigate('/')}
              className='mt-4 text-[#1E3A8A] font-medium hover:underline'
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
