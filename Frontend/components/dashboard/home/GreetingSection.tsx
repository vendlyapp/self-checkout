'use client';

import { Clock, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStoreState } from '@/lib/stores';
import { useUser } from '@/lib/contexts/UserContext';
import { useMyStore } from '@/hooks/queries/useMyStore';
import type { GreetingSectionProps } from '../types';

const GreetingSection = ({ onToggleStore }: GreetingSectionProps) => {
  const { isStoreOpen: globalStoreOpen, toggleStore, isLoading, syncFromStoreData } =
    useStoreState();
  const { data: store } = useMyStore();
  const { profile } = useUser();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [weather, setWeather] = useState<string>('');

  const isStoreOpen = store?.isOpen ?? globalStoreOpen;

  useEffect(() => {
    syncFromStoreData(store);
  }, [store, syncFromStoreData]);

  const getUserName = () => {
    if (profile?.name) {
      return profile.name.split(' ')[0];
    }
    return 'Willkommen';
  };

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
        const cached =
          typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
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
          const value = `${Math.round(data.main.temp)}°C`;
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

  const handleToggle = async () => {
    await toggleStore();
    onToggleStore?.();
  };

  const toggleButton = (widthOpen: string, widthClosed: string) => (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        relative inline-flex h-8 items-center rounded-full
        transition-ios
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isStoreOpen ? 'bg-brand-500' : 'bg-gray-300'}
      `}
      style={{ width: isStoreOpen ? widthOpen : widthClosed }}
      role="switch"
      aria-checked={isStoreOpen}
      aria-label="Toggle store status"
    >
      <span
        className={`absolute left-4 text-xs font-medium text-white transition-ios ${
          isStoreOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isStoreOpen ? 'Geöffnet' : ''}
      </span>
      <span
        className={`absolute right-4 text-xs font-medium text-gray-600 transition-ios ${
          isStoreOpen ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Geschlossen
      </span>
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${
          isStoreOpen ? 'translate-x-[70px]' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <section className="mb-6 mt-4">
      <div className="block md:hidden">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Hoi {getUserName()}
              <span className="ml-2">👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-4">{toggleButton('100px', '120px')}</div>
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
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm text-gray-600">Geschäft:</span>
              {toggleButton('100px', '120px')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GreetingSection;
