'use client';

import type { SearchResultsSectionProps } from './types';

const SearchResultsSection = ({ 
  isSearching, 
  results 
}: SearchResultsSectionProps) => (
  <section className="mb-6">
    {isSearching ? (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
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
            className="
              w-full p-4 bg-white border border-gray-200 rounded-xl 
              text-left hover:border-gray-300 
              active:scale-[0.98] transition-transform duration-150
              shadow-sm
            "
          >
            <p className="text-gray-900 font-medium">{result.name}</p>
            <p className="text-sm text-gray-600 mt-1">Tap to view details</p>
          </button>
        ))}
      </div>
    )}
  </section>
);

export default SearchResultsSection; 