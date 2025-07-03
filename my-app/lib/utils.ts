import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export haptic feedback utilities
export * from './utils/hapticFeedback';

// Export visual feedback utilities  
export * from './utils/visualFeedback';
