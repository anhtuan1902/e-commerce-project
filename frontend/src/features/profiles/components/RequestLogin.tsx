import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RequestLogin = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col items-center justify-center h-[60vh] text-center px-4'>
      <AlertCircle className='h-16 w-16 text-gray-400 mb-4' />
      <h2 className='text-2xl font-bold text-gray-900'>Yêu cầu đăng nhập</h2>
      <p className='text-gray-500 mt-2 mb-6'>Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
      <button
        onClick={() => navigate('/login')}
        className='bg-[#1E3A8A] text-white px-6 py-2 rounded-lg font-medium'
      >
        Đăng nhập
      </button>
    </div>
  );
};

export default RequestLogin;
