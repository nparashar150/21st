import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (seconds: number, showMs = false): string => {
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = Math.floor(absSeconds % 60);
  const ms = Math.floor((absSeconds % 1) * 1000);

  const sign = seconds < 0 ? '-' : '';

  if (hours > 0) {
    const formatted = `${sign}${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return showMs ? `${formatted}.${ms.toString().padStart(3, '0')}` : formatted;
  }

  const formatted = `${sign}${minutes}:${secs.toString().padStart(2, '0')}`;
  return showMs ? `${formatted}.${ms.toString().padStart(3, '0')}` : formatted;
};
