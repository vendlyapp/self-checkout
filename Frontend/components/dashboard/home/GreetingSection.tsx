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

  // Update time and date every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Update time
      const timeString = now.toLocaleTimeString('de-CH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
      
      // Update date
      const dateString = now.toLocaleDateString('de-CH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setCurrentDate(dateString);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real weather data
  useEffect(() => {
    const getWeather = async () => {
      try {
        // Try to get user's location, fallback to Zurich, Switzerland
        const getLocationWeather = async (lat: number, lon: number) => {
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          
          if (!apiKey) {
            // If no API key, use a fallback temperature based on time of day
            const hour = new Date().getHours();
            const baseTemp = hour >= 6 && hour < 18 ? 22 : 15; // Day: 22°C, Night: 15°C
            const variation = Math.floor(Math.random() * 5) - 2; // ±2°C variation
            setWeather(`${baseTemp + variation}°C`);
            return;
          }

          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`
            );
            
            if (response.ok) {
              const data = await response.json();
              const temp = Math.round(data.main.temp);
              setWeather(`${temp}°C`);
            } else {
              throw new Error('Weather API error');
            }
          } catch (apiError) {
            // Fallback if API fails
            const hour = new Date().getHours();
            const baseTemp = hour >= 6 && hour < 18 ? 22 : 15;
            const variation = Math.floor(Math.random() * 5) - 2;
            setWeather(`${baseTemp + variation}°C`);
          }
        };

        // Try to get user's geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              getLocationWeather(position.coords.latitude, position.coords.longitude);
            },
            () => {
              // If geolocation fails, use Zurich, Switzerland as default
              getLocationWeather(47.3769, 8.5417);
            },
            { timeout: 5000 }
          );
        } else {
          // No geolocation support, use Zurich
          getLocationWeather(47.3769, 8.5417);
        }
      } catch (error) {
        // Final fallback
        const hour = new Date().getHours();
        const baseTemp = hour >= 6 && hour < 18 ? 22 : 15;
        setWeather(`${baseTemp}°C`);
      }
    };

    getWeather();
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

            {/* Store Status Toggle */}
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
                  width: globalStoreOpen ? '80px' : '100px'
                }}
                role="switch"
                aria-checked={globalStoreOpen}
                aria-label="Toggle store status"
              >
                <span
                  className={`
                    absolute left-3 text-xs font-medium text-white transition-ios
                    ${globalStoreOpen ? 'opacity-100' : 'opacity-0'}
                  `}
                >
                  {globalStoreOpen ? 'Offen' : ''}
                </span>
                <span
                  className={`
                    absolute right-3 text-xs font-medium text-gray-600 transition-ios
                    ${globalStoreOpen ? 'opacity-0' : 'opacity-100'}
                  `}
                >
                  Zu
                </span>
                <span
                  className={`
                    inline-block h-5 w-5 transform rounded-full bg-white
                    transition duration-200 ease-in-out shadow-sm
                    ${globalStoreOpen ? 'translate-x-[55px]' : 'translate-x-1'}
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
