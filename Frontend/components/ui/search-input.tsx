'use client';

import { Search, X, Filter, Command } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
  esHome?: boolean;
  showFilters?: boolean;
  onFilterClick?: () => void;
  recentSearches?: string[];
  onRecentSearchClick?: (search: string) => void;
}

export function SearchInput({
  placeholder = "Suchen...",
  value: controlledValue,
  onChange,
  onSearch,
  className,
  esHome = false,
  showFilters = false,
  onFilterClick,
  recentSearches = [],
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Usar valor controlado o interno
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledValue !== undefined ? onChange! : setInternalValue;

  // Manejar cambio de input
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
    setShowSuggestions(newValue.length > 0 || recentSearches.length > 0);
  }, [onChange, setValue, recentSearches.length]);

  // Manejar búsqueda
  const handleSearch = useCallback(() => {
    if (value.trim() && onSearch) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  }, [value, onSearch]);

  // Manejar tecla Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [handleSearch]);

  // Limpiar búsqueda
  const handleClear = useCallback(() => {
    setValue('');
    inputRef.current?.focus();
    setShowSuggestions(false);
  }, [setValue]);

  // Manejar click en sugerencia
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setValue(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [setValue, onSearch]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estilo para Home Dashboard
  if (esHome) {
    return (
      <div ref={containerRef} className={clsx("relative w-full", className)}>
        <div className={clsx(
          "relative flex items-center bg-white rounded-full border transition-all duration-200",
          "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20",
          isFocused ? "shadow-lg" : "shadow-sm",
          "h-12 lg:h-14"
        )}>
          {/* Icono de búsqueda - Solo en desktop */}
          <Search className="hidden lg:block absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(value.length > 0 || recentSearches.length > 0);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={clsx(
              "w-full h-full bg-transparent focus:outline-none text-gray-900 placeholder-gray-400",
              "pl-4 lg:pl-12 pr-16 lg:pr-20",
              "text-base lg:text-lg"
            )}
          />

          {/* Botón de filtros - Solo en desktop */}
          {showFilters && onFilterClick && (
            <button
              onClick={onFilterClick}
              className="hidden lg:flex absolute right-16 items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              aria-label="Filter"
            >
              <Filter className="w-3 h-3" />
              <span>Filter</span>
            </button>
          )}

          {/* Botón de limpiar */}
          {value && (
            <button
              onClick={handleClear}
              className="absolute right-12 lg:right-16 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
              aria-label="Suche löschen"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          )}

          {/* Botón de búsqueda */}
          <button
            onClick={handleSearch}
            className={clsx(
              "absolute right-2 w-8 h-8 lg:w-10 lg:h-10 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center transition-all duration-200",
              "shadow-md hover:shadow-lg hover:scale-105"
            )}
            aria-label="Suchen"
          >
            <Search className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </button>
        </div>

        {/* Sugerencias - Solo en desktop */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
            {/* Búsquedas recientes */}
            {recentSearches.length > 0 && !value && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Command className="w-3 h-3" />
                  <span>Búsquedas recientes</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugerencias de búsqueda */}
            {value && (
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-2">Suchen &quot;{value}&quot;</div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSuggestionClick(value)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150 flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-gray-400" />
                    Suchen &quot;{value}&quot;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Estilo original para Analytics Dashboard
  return (
    <div className={clsx("relative w-full", className)}>
      <div className="relative flex items-center h-14 bg-white rounded-full border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200">
        {/* Icono de búsqueda */}
        <Search className="absolute left-4 w-6 h-6 text-gray-400 pointer-events-none" />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-full pl-14 pr-14 text-lg text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
        />

        {/* Botón de limpiar */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
