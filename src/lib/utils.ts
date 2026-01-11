import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return import.meta.env.VITE_DEFAULT_AVATAR_URL || "https://ui-avatars.com/api/?name=User";

  if (path.startsWith('http')) return path;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
};