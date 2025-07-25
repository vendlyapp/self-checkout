// components/navigation/Header.tsx
'use client';

import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications - en producción vendrían de una API
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Neue Bestellung',
    message: 'Sie haben eine neue Bestellung erhalten',
    time: 'Vor 5 Minuten',
    read: false,
  },
  {
    id: '2',
    title: 'Produkt aktualisiert',
    message: 'Das Produkt "Coffee Blend" wurde aktualisiert',
    time: 'Vor 1 Stunde',
    read: true,
  },
];

export default function HeaderUser() {
  const [showNotifications, setShowNotifications] = useState(false);

  // Calcular notificaciones no leídas
  const unreadCount = useMemo(
    () => mockNotifications.filter(n => !n.read).length,
    []
  );

  

  // Cerrar notificaciones al hacer click fuera
  const handleClickOutside = useCallback(() => {
    if (showNotifications) {
      setShowNotifications(false);
    }
  }, [showNotifications]);

  return (
    <>
      {/* Overlay para cerrar dropdown */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={handleClickOutside}
          aria-hidden="true"
        />
      )}

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