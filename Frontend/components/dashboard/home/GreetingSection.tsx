'use client';

import { Clock, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStoreState } from '@/lib/stores';
import { useUser } from '@/lib/contexts/UserContext';
import type { GreetingSectionProps } from '../types';

const GreetingSection = ({
  onToggleStore
}: GreetingSectionProps) => {
  const { 
    isStoreOpen: globalStoreOpen, 
    toggleStore,
    isLoading,
    fetchStoreStatus 
  } = useStoreState();
  const { profile } = useUser();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [weather, setWeather] = useState<string>('');

  // Get user's first name or fallback
  const getUserName = () => {
    if (profile?.name) {
      // Extract first name if full name is provided
      const firstName = profile.name.split(' ')[0];
      return firstName;
    }
    return 'Willkommen'; // Fallback greeting
  };

  // Fetch store status when component mounts
  useEffect(() => {
    fetchStoreStatus();
  }, [fetchStoreStatus]);

  // Update time and date (every 10s to avoid excessive re-renders; clock still shows seconds on next tick)
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('de-CH', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 10_000);
    return () => clearInterval(interval);
  }, []);

  // Weather: in-memory cache (10 min TTL) to avoid repeated API calls; deterministic fallback for SSR/hydration
  const WEATHER_CACHE_KEY = 'greeting_weather';
  const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

  useEffect(() => {
    const getLocationWeather = async (lat: number, lon: number) => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        const hour = new Date().getHours();
        const baseTemp = hour >= 6 && hour < 18 ? 22 : 15;
        setWeather(`${baseTemp}°C`);
        return;
      }
      const cacheKey = `${WEATHER_CACHE_KEY}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
      try {
        const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
        if (cached) {
          const { value, ts } = JSON.parse(cached);
          if (Date.now() - ts < WEATHER_CACHE_TTL_MS) {
            setWeather(value);
            return;
          }
        }
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`
        );
        if (response.ok) {
          const data = await response.json();
          const temp = Math.round(data.main.temp);
          const value = `${temp}°C`;
          setWeather(value);
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(cacheKey, JSON.stringify({ value, ts: Date.now() }));
          }
        } else {
          throw new Error('Weather API error');
        }
      } catch {
        const hour = new Date().getHours();
        const baseTemp = hour >= 6 && hour < 18 ? 22 : 15;
        setWeather(`${baseTemp}°C`);
      }
    };

    if (typeof navigator === 'undefined') return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => getLocationWeather(pos.coords.latitude, pos.coords.longitude),
        () => getLocationWeather(47.3769, 8.5417),
        { timeout: 5000 }
      );
    } else {
      getLocationWeather(47.3769, 8.5417);
    }
  }, []);

  return (
    <section className="mb-6 mt-4">
      {/* Solo móvil (< 768px) */}
      <div className="block md:hidden">
        {/* Top Row: Greeting + Store Toggle */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Hoi {getUserName()}
              <span className="ml-2">👋</span>
            </h1>
          </div>

          {/* Store Status Toggle with text inside */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={async () => {
                await toggleStore();
                onToggleStore?.(); // Mantener compatibilidad con props
              }}
              disabled={isLoading}
              className={`
                relative inline-flex h-8 items-center rounded-full
                transition-ios
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
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
                  absolute left-4 text-xs font-medium text-white transition-ios
                  ${globalStoreOpen ? 'opacity-100' : 'opacity-0'}
                `}
              >
                {globalStoreOpen ? 'Geöffnet' : ''}
              </span>
              <span
                className={`
                  absolute right-4 text-xs font-medium text-gray-600 transition-ios
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
            <span className="text-sm text-gray-600">
              {weather} • {currentDate}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet + Desktop (≥ 768px) - mismo layout organizado */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              Hoi {getUserName()}
              <span className="ml-1 md:ml-2">👋</span>
            </h1>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 flex-shrink-0">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span>{weather}</span>
              <span>•</span>
              <span>{currentDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>

            {/* Store Status Toggle - mismo tamaño que móvil para verse completo */}
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm text-gray-600">Geschäft:</span>
              <button
                onClick={async () => {
                  await toggleStore();
                  onToggleStore?.();
                }}
                disabled={isLoading}
                className={`
                  relative inline-flex h-8 items-center rounded-full
                  transition-ios
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
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
                    absolute left-4 text-xs font-medium text-white transition-ios
                    ${globalStoreOpen ? 'opacity-100' : 'opacity-0'}
                  `}
                >
                  {globalStoreOpen ? 'Geöffnet' : ''}
                </span>
                <span
                  className={`
                    absolute right-4 text-xs font-medium text-gray-600 transition-ios
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
        </div>
      </div>
    </section>
  );
};

export default GreetingSection;
