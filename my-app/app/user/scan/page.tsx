'use client'
import HeaderUser from '@/components/navigation/user/HeaderUser';
import SnanerDash from '@/components/user/SnanerDash';

export default function ScanPage() {
  return (
    <div className='z-10 fixed inset-0 bg-[#191F2D] overflow-hidden'>
      <HeaderUser isDarkMode={true} />
      <div className="fixed top-[85px] left-0 right-0 z-50 bg-[#191F2D] border-b border-gray-700">
        <div className='flex items-center justify-between w-full px-4 py-3'>
          <div className='flex flex-col items-start justify-start'>
            <p className='text-sm text-white font-bold text-[21px]'>Heinigers Hofladen</p>
            <p className='text-sm text-gray-400 text-[14px]'>Grundhof 3, 8305 Dietlikon • ⭐ 4.8</p>
          </div>
          <div className='flex items-center justify-end'>
            <button className='bg-[#FFFFFF] text-[#6E7996] px-4 py-2 rounded-md hover:bg-gray-600 transition-colors'>
              Kontakt
            </button>
          </div>
        </div>
      </div>
      <SnanerDash />
    </div>
  );
}