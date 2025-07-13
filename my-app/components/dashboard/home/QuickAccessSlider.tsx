'use client';

import React, { useRef, useState } from 'react';
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
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const itemsPerSlide = 4;
  const maxSlides = Math.ceil(items.length / itemsPerSlide);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    
    const x = e.touches[0].clientX;
    const diffX = startX.current - x;
    const threshold = sliderRef.current.offsetWidth * 0.2;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentSlide < maxSlides - 1) {
        onSlideChange(currentSlide + 1);
        isDragging.current = false;
      } else if (diffX < 0 && currentSlide > 0) {
        onSlideChange(currentSlide - 1);
        isDragging.current = false;
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Schnellzugriff</h2>
      
      <div className="relative">
        <div 
          ref={sliderRef}
          className="overflow-hidden rounded-2xl touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentSlide * 50}%)` }}
          >
            {Array.from({ length: maxSlides }, (_, slideIndex) => (
              <div key={slideIndex} className="grid grid-cols-4 gap-2 min-w-full px-1">
                {items.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((item: QuickAccessItem) => {
                  const [pressed, setPressed] = useState(false);
                  return (
                    <button
                      key={item.id}
                      className={`bg-white border border-border/10 rounded-2xl p-3 flex flex-col items-center justify-center hover:shadow-md shadow-sm min-h-[100px] transition-transform duration-150 ${pressed ? 'scale-95' : ''}`}
                      onTouchStart={() => setPressed(true)}
                      onTouchEnd={() => setPressed(false)}
                      onMouseDown={() => setPressed(true)}
                      onMouseUp={() => setPressed(false)}
                      onMouseLeave={() => setPressed(false)}
                    >
                      {/* Green icon container */}
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-2 shadow-sm">
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
                  length: itemsPerSlide - items.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).length 
                }, (_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px]" />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Slide indicators */}
        {maxSlides > 1 && (
          <SliderIndicators 
            maxSlides={maxSlides}
            currentSlide={currentSlide}
            onSlideChange={onSlideChange}
          />
        )}
      </div>
    </section>
  );
};

export default QuickAccessSlider; 