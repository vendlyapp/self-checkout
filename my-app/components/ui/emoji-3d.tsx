'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';

interface Emoji3DProps {
  emoji: string;
  size?: number;
  className?: string;
  alt?: string;
}

export const Emoji3D = ({ 
  emoji, 
  size = 32, 
  className,
  alt
}: Emoji3DProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convierte el emoji a su código unicode (maneja emojis complejos)
  const getEmojiCodePoint = (emoji: string): string => {
    const codePoint = emoji.codePointAt(0);
    if (!codePoint) return '';
    return codePoint.toString(16).toLowerCase();
  };

  const codePoint = getEmojiCodePoint(emoji);
  const src = `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/${emoji.replace(/\s+/g, '')}/3D/${codePoint}_3d.png`;

  // Fallback si hay error o no hay codePoint
  if (hasError || !codePoint) {
    return (
      <span 
        className={clsx("inline-block text-center", className)}
        style={{ fontSize: size * 0.8 }}
        role="img"
        aria-label={alt || emoji}
      >
        {emoji}
      </span>
    );
  }

  return (
    <div className={clsx("relative inline-block", className)}>
      {/* Skeleton loader mientras carga */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      
      {/* Imagen 3D */}
      <Image
        src={src}
        alt={alt || emoji}
        width={size}
        height={size}
        className={clsx(
          "emoji-3d object-contain transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
        draggable={false}
        unoptimized
      />
    </div>
  );
};

// Componente específico para ActionCards con tamaños predefinidos
export const ActionEmoji = ({ 
  emoji, 
  className 
}: { 
  emoji: string; 
  className?: string; 
}) => (
  <Emoji3D 
    emoji={emoji}
    size={24}
    className={clsx("w-6 h-6", className)}
  />
); 