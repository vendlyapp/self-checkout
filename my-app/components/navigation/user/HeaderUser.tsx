// components/navigation/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface HeaderUserProps {
  isDarkMode?: boolean;
}

export default function HeaderUser({ isDarkMode = false }: HeaderUserProps) {
  const logoSrc = isDarkMode ? "/logo-b.svg" : "/logo.svg";
  const headerBgClass = isDarkMode ? "bg-[#191F2D]" : "bg-background-cream";
  const borderClass = isDarkMode ? "border-slate-700" : "border-white";
 
  return (
    <>
      <header className="dashboard-header h-[85px] w-full flex items-center justify-center">
        <div className={`dashboard-header-content ${headerBgClass} h-[85px] w-full flex border-b ${borderClass} items-center justify-center`}>
           {/* Logo */}
          <div className="flex items-center justify-start w-1/2 pl-6">
            <Image 
                src="/user-logo.svg" 
                alt="Self-Checkout Logo"
                width={100} 
                height={100}
                className='w-[100px] h-[100px]'
                priority
              />
          </div>
          <div className="flex items-center justify-center w-1/2">
            <Link href="/dashboard" className="dashboard-logo">
              <Image 
                src={logoSrc}  
                alt="Self-Checkout Logo" 
                width={150} 
                height={150}
                priority
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}