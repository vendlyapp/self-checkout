'use client';

import type { SearchResultsSectionProps } from '../types';
import React, { useState } from 'react';
import { Loader } from '@/components/ui/Loader';

const SearchResultsSection = ({ 
  isSearching, 
  results 
}: SearchResultsSectionProps) => {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  return (
    <section className="mb-6">
      {isSearching ? (
        <div className="text-center py-8">
          <Loader size="sm" className="mx-auto mb-3" />
          <p className="text-gray-600">Suche läuft...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Suchergebnisse ({results.length})
          </h3>
          
          {results.map((result, idx) => (
            <button 
              key={result.id}
              className={`w-full p-4 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 shadow-sm transition-transform duration-150 ${pressedIndex === idx ? 'scale-95' : ''}`}
              onTouchStart={() => setPressedIndex(idx)}
              onTouchEnd={() => setPressedIndex(null)}
              onMouseDown={() => setPressedIndex(idx)}
              onMouseUp={() => setPressedIndex(null)}
              onMouseLeave={() => setPressedIndex(null)}
            >
              <p className="text-gray-900 font-medium">{result.name}</p>
              <p className="text-sm text-gray-600 mt-1">Tap to view details</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchResultsSection; 