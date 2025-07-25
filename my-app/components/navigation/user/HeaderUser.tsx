// components/navigation/Header.tsx
'use client';

import Link from 'next/link';


import Image from 'next/image';



export default function HeaderUser() {
 
  return (
    <>
      

      <header className="dashboard-header h-[85px] w-full flex items-center justify-center">
        <div className="dashboard-header-content bg-background-cream h-[85px] w-full flex items-center justify-center">
           {/* Logo */}
          <div className="flex items-center justify-start w-1/2  pl-6">
            <Image 
                src="/user-logo.svg" 
                alt="Self-Checkout Logo"
                width={100} 
                height={100}
                priority
              />
          </div>
          <div className="flex items-center justify-center w-1/2">
            <Link href="/dashboard" className="dashboard-logo">
              <Image 
                src="/logo.svg" 
                alt="Self-Checkout Logo" 
                width={100} 
                height={100}
                priority
              />
            </Link>

          </div>
          
          
        </div>
      
      </header>
    </>
  );
}