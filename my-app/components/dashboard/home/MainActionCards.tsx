'use client';

import ActionCard from './ActionCard';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const MainActionCards = () => {
  const router = useRouter();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const actions = [
    {
      emoji: '🧾',
      title: 'Kassieren',
      subtitle: 'Verkauf starten',
      isPrimary: true,
      onClick: () => router.push('/charge'),
      link: '/charge',
    },
    {
      emoji: '📦',
      title: 'Produkte',
      subtitle: '245 Artikel',
      onClick: () => router.push('/products_list'),
      link: '/products_list',
    },
  ];

  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 gap-3 mb-4 text-xl">
        {actions.map((action, idx) => (
          <ActionCard
            key={action.title}
            {...action}
            className={` ${pressedIndex === idx ? 'scale-95 transition-transform duration-150 ' : 'transition-transform duration-150'}`}
            onTouchStart={() => setPressedIndex(idx)}
            onTouchEnd={() => setPressedIndex(null)}
            onMouseDown={() => setPressedIndex(idx)}
            onMouseUp={() => setPressedIndex(null)}
            onMouseLeave={() => setPressedIndex(null)}
          />
        ))}
      </div>
    </section>
  );
};

export default MainActionCards; 