'use client';

import { Clock, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStoreState } from '@/lib/stores';
import type { GreetingSectionProps } from '../types';

const GreetingSection = ({
  isStoreOpen,
  onToggleStore
}: GreetingSectionProps) => {
  const { isStoreOpen: globalStoreOpen, toggleStore } = useStoreState();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<string>('');

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simple weather simulation (you can replace this with a real API)
  useEffect(() => {
    const getWeather = async () => {
      try {
        // For demo purposes, using a simple weather simulation
        // In production, you would use a real weather API like OpenWeatherMap
        const temperatures = [18, 20, 22, 19, 21, 23];
        const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
        setWeather(`${randomTemp}°C`);
      } catch {
        setWeather('18°C'); // Fallback
      }
    };

    getWeather();
  }, []);

  return (
    <section className="mb-6 mt-4">
      {/* Top Row: Greeting + Store Toggle */}
      <div className="flex items-start justify-between mb-2 lg:mb-4">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Hoi Peter
            <span className="ml-2">👋</span>
          </h1>
        </div>

        {/* Store Status Toggle with text inside */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => {
              toggleStore();
              onToggleStore(); // Mantener compatibilidad con props
            }}
            className={`
              relative inline-flex h-8 lg:h-10 items-center rounded-full
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
              ${globalStoreOpen ? 'bg-brand-500' : 'bg-gray-300'}
            `}
            style={{
              width: globalStoreOpen ? '100px' : '120px'
            }}
            role="switch"
            aria-checked={globalStoreOpen}
            aria-label="Toggle store status"
          >
            <span
              className={`
                absolute left-4 text-xs font-medium text-white transition-all duration-200 ease-in-out
                ${globalStoreOpen ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {globalStoreOpen ? 'Geöffnet' : ''}
            </span>
            <span
              className={`
                absolute right-4 text-xs font-medium text-gray-600 transition-all duration-200 ease-in-out
                ${globalStoreOpen ? 'opacity-0' : 'opacity-100'}
              `}
            >
              Geschlossen
            </span>
            <span
              className={`
                inline-block h-6 w-6 transform rounded-full bg-white
                transition duration-200 ease-in-out shadow-sm
                ${globalStoreOpen ? 'translate-x-[70px]' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-yellow-500" />
          <span className="text-sm lg:text-base text-gray-600">
            {weather} • {new Date().toLocaleDateString('de-DE', {
              weekday: 'short',
              day: 'numeric',
              month: 'long'
            })}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm lg:text-base text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>seit {currentTime} Uhr</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GreetingSection;
