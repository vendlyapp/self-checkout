'use client';

import type { SearchResultsSectionProps } from '../types';
import React from 'react';
import { Loader } from '@/components/ui/Loader';

const SearchResultsSection = ({ isSearching, results }: SearchResultsSectionProps) => {
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
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-left hover:border-gray-300 shadow-sm active:scale-95 transition-transform duration-100"
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