import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(v: number) {
  const absV = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  
  if (absV >= 1_000_000_000) return `${sign}$${(absV / 1_000_000_000).toFixed(1)}B`;
  if (absV >= 1_000_000) return `${sign}$${(absV / 1_000_000).toFixed(1)}M`;
  if (absV >= 1_000) return `${sign}$${(absV / 1_000).toFixed(1)}K`; // Changed to .1 for more precision if requested, or keep .0
  return `${sign}$${absV.toFixed(0)}`;
}

export function formatNumber(v: number) {
  const absV = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  
  if (absV >= 1_000_000_000) return `${sign}${(absV / 1_000_000_000).toFixed(1)}B`;
  if (absV >= 1_000_000) return `${sign}${(absV / 1_000_000).toFixed(1)}M`;
  if (absV >= 1_000) return `${sign}${(absV / 1_000).toFixed(1)}K`;
  return `${sign}${absV.toLocaleString()}`;
}
