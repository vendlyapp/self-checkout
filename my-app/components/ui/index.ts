// UI Components Index - Core Components
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { default as Squircle } from './squircle';
export { default as SquircleShowcase } from './squircle-showcase';

// Re-export squircle hook and utilities
export { 
  useSquircle, 
  SQUIRCLE_PRESETS, 
  getSquircleClass, 
  clampSmoothing, 
  smoothingToPercentage 
} from '@/lib/hooks/useSquircle';
export type { SquirclePreset } from '@/lib/hooks/useSquircle'; 