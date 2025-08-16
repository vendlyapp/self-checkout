'use client';

import React, { useState, useCallback } from 'react';
import type { QuickAccessSliderProps, SliderIndicatorsProps, QuickAccessItem } from '../types';

const SliderIndicators = ({ 
  maxSlides, 
  currentSlide, 
  onSlideChange 
}: SliderIndicatorsProps) => (
  <div className="flex justify-center gap-2 mt-4">
    {Array.from({ length: maxSlides }, (_, index) => (
      <button
        key={index}
        onClick={() => onSlideChange(index)}
        className={`
          w-2 h-2 rounded-full transition-colors duration-200
          ${index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'}
        `}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))}
  </div>
);

const QuickAccessSlider = ({ 
  items, 
  currentSlide, 
  onSlideChange 
}: QuickAccessSliderProps) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const itemsPerSlide = 4;
  const maxSlides = Math.ceil(items.length / itemsPerSlide);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  // Create infinite items by duplicating at start and end
  const createInfiniteItems = useCallback(() => {
    if (items.length === 0) return [];
    
    // Duplicate items for infinite effect
    const duplicatedItems = [...items, ...items, ...items];
    return duplicatedItems;
  }, [items]);

  const infiniteItems = createInfiniteItems();
  const infiniteMaxSlides = Math.ceil(infiniteItems.length / itemsPerSlide);
  
  // Calculate the real slide position (accounting for the duplicated items)
  const realSlide = currentSlide + maxSlides;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    
    const x = e.touches[0].clientX;
    const diffX = startX.current - x;
    const threshold = sliderRef.current.offsetWidth * 0.15; // Reduced threshold for better UX
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe left - go to next slide
        const nextSlide = currentSlide + 1;
        if (nextSlide >= maxSlides) {
          // Reset to beginning for infinite effect
          onSlideChange(0);
        } else {
          onSlideChange(nextSlide);
        }
        isDragging.current = false;
      } else if (diffX < 0) {
        // Swipe right - go to previous slide
        const prevSlide = currentSlide - 1;
        if (prevSlide < 0) {
          // Go to end for infinite effect
          onSlideChange(maxSlides - 1);
        } else {
          onSlideChange(prevSlide);
        }
        isDragging.current = false;
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Handle slide change with infinite logic
  const handleSlideChange = useCallback((newSlide: number) => {
    if (newSlide >= maxSlides) {
      onSlideChange(0);
    } else if (newSlide < 0) {
      onSlideChange(maxSlides - 1);
    } else {
      onSlideChange(newSlide);
    }
  }, [maxSlides, onSlideChange]);

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Schnellzugriff</h2>
      
      <div className="relative">
        <div 
          ref={sliderRef}
          className="overflow-hidden rounded-2xl touch-none w-[100%] p-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${realSlide * 49.5}%)` }}
          >
            {Array.from({ length: infiniteMaxSlides }, (_, slideIndex) => (
              <div key={slideIndex} className="grid grid-cols-4 gap-2 min-w-full px-1">
                {infiniteItems.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((item: QuickAccessItem, idx: number) => {
                  const globalIdx = slideIndex * itemsPerSlide + idx;
                  return (
                    <button
                    key={`${item.id}-${slideIndex}-${idx}`}
                    className={`bg-white border border-border/10 rounded-2xl p-3 flex flex-col items-center justify-center hover:shadow-md shadow-sm min-h-[100px] transition-transform duration-150 ${pressedIndex === globalIdx ? 'scale-95' : ''}`}
                    onTouchStart={() => setPressedIndex(globalIdx)}
                    onTouchEnd={() => setPressedIndex(null)}
                    onMouseDown={() => setPressedIndex(globalIdx)}
                    onMouseUp={() => setPressedIndex(null)}
                    onMouseLeave={() => setPressedIndex(null)}
                  >
                    {/* Green icon container */}
                    <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center mb-2 shadow-sm">
                      <div className="text-white [&>svg]:w-4 [&>svg]:h-4">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Black text */}
                    <span className="text-xs font-medium text-foreground leading-tight text-center">
                      {item.label}
                    </span>
                  </button>
                  );
                })}
                {/* Fill empty slots if needed */}
                {Array.from({ 
                  length: itemsPerSlide - infiniteItems.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).length 
                }, (_, i) => (
                  <div key={`empty-${slideIndex}-${i}`} className="min-h-[100px]" />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Slide indicators - only show for original slides */}
        {maxSlides > 1 && (
          <SliderIndicators 
            maxSlides={maxSlides}
            currentSlide={currentSlide}
            onSlideChange={handleSlideChange}
          />
        )}
      </div>
    </section>
  );
};

export default QuickAccessSlider; 