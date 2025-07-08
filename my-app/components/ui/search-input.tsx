'use client';

import { Search, X } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { clsx } from 'clsx';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  className?: string;
  esHome?: boolean;
}

export function SearchInput({
  placeholder = "Buscar...",
  value: controlledValue,
  onChange,
  onSearch,
  className,
  esHome = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Usar valor controlado o interno
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledValue !== undefined ? onChange! : setInternalValue;

  // Manejar cambio de input
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange, setValue]);

  // Manejar búsqueda
  const handleSearch = useCallback(() => {
    if (value.trim() && onSearch) {
      onSearch(value.trim());
    }
  }, [value, onSearch]);

  // Manejar tecla Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // Limpiar búsqueda
  const handleClear = useCallback(() => {
    setValue('');
    inputRef.current?.focus();
  }, [setValue]);

  // Estilo para Home Dashboard
  if (esHome) {
    return (
      <div className={clsx("relative w-full", className)}>
        <div className="relative flex items-center h-14 bg-white rounded-full border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-200">
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-full pl-6 pr-16 text-lg text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
          />

          {/* Botón de limpiar */}
          {value && (
            <button
              onClick={handleClear}
              className="absolute right-16 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Botón de búsqueda - Círculo verde a la derecha */}
          <button
            onClick={handleSearch}
            className="absolute right-2 w-10 h-10 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center transition-colors duration-200 shadow-md hover:shadow-lg"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
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