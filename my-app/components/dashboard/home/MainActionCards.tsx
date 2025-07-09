'use client';

import ActionCard from './ActionCard';

const MainActionCards = () => (
  <section className="mb-6">
    <div className="grid grid-cols-2 gap-3 mb-4">
      <ActionCard
        emoji="🧾"
        title="Kassieren"
        subtitle="Verkauf starten"
        isPrimary={true}
        onClick={() => console.log('Kassieren clicked')}
      />
      <ActionCard
        emoji="📦"
        title="Produkte"
        subtitle="245 Artikel"
        onClick={() => console.log('Produkte clicked')}
      />
    </div>
  </section>
);

export default MainActionCards; 