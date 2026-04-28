import { Heart, Mail, PhoneCall } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className='bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-8 mt-auto transition-colors duration-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
          <div className='col-span-1 md:col-span-1'>
            <div className='flex items-center mb-4'>
              <Logo customClass='h-16 sm:h-18 md:h-20 lg:h-25 w-auto mr-1 sm:mr-2' />
            </div>
            <p className='text-sm text-gray-400 dark:text-gray-500'>
              Nền tảng mua sắm đa cửa hàng hàng đầu, kết nối hàng triệu người mua và người bán trên
              toàn quốc.
            </p>
          </div>
          <div>
            <h3 className='text-white dark:text-gray-100 font-semibold mb-4'>Dành cho Người mua</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>
                  Theo dõi đơn hàng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='text-white dark:text-gray-100 font-semibold mb-4'>Dành cho Người bán</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>
                  Mở cửa hàng
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>
                  Quy định người bán
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>
                  Trung tâm hỗ trợ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='text-white dark:text-gray-100 font-semibold mb-4'>Liên hệ</h3>
            <ul className='space-y-2 text-sm'>
              <li className='flex items-center'>
                <Mail className='h-4 w-4 mr-2' /> Email: trantuan1902.tt@gmail.com
              </li>
              <li className='flex items-center'>
                <PhoneCall className='h-4 w-4 mr-2' /> Hotline: 0377763440
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-800 dark:border-gray-800 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 dark:text-gray-500'>
          <p>&copy; 2026 MultiMarket. All rights reserved.</p>
          <p className='flex items-center mt-4 md:mt-0'>
            Làm với <Heart className='h-4 w-4 text-red-500 mx-1 fill-current' /> tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
