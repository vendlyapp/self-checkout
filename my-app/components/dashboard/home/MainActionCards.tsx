'use client';

import ActionCard from './ActionCard';
import React, { useState } from 'react';

const MainActionCards = () => {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const actions = [
    {
      emoji: '🧾',
      title: 'Kassieren',
      subtitle: 'Verkauf starten',
      isPrimary: true,
      onClick: () => console.log('Kassieren clicked'),
    },
    {
      emoji: '📦',
      title: 'Produkte',
      subtitle: '245 Artikel',
      onClick: () => console.log('Produkte clicked'),
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