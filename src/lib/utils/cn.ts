import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes safely — use this instead of template literals
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}