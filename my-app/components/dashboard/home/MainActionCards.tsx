'use client';

import { Receipt, Package } from 'lucide-react';
import ActionCard from './ActionCard';

const MainActionCards = () => (
  <section className="mb-6">
    <div className="grid grid-cols-2 gap-3">
      <ActionCard
        icon={<Receipt className="w-5 h-5" />}
        title="Kassieren"
        subtitle="Verkauf starten"
        isPrimary={true}
        onClick={() => console.log('Kassieren clicked')}
      />
      <ActionCard
        icon={<Package className="w-5 h-5 text-gray-700" />}
        title="Produkte"
        subtitle="245 Artikel"
        onClick={() => console.log('Produkte clicked')}
      />
    </div>
  </section>
);

export default MainActionCards; 