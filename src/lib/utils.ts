import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import i18n from "./i18n"

export function getCurrencySymbol() {
  if (typeof window === 'undefined') return '$';
  const lang = i18n.language || 'en';
  if (lang.startsWith('es') || lang.startsWith('de') || lang.startsWith('fr')) return '€';
  if (lang.startsWith('pt')) return 'R$';
  return '$';
}

export function formatMoney(v: number) {
  const absV = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  const c = getCurrencySymbol();
  
  if (absV >= 1e33) return `${sign}${c}${(absV / 1e33).toFixed(1)}Dc`; // Decillion
  if (absV >= 1e30) return `${sign}${c}${(absV / 1e30).toFixed(1)}No`; // Nonillion
  if (absV >= 1e27) return `${sign}${c}${(absV / 1e27).toFixed(1)}Oc`; // Octillion
  if (absV >= 1e24) return `${sign}${c}${(absV / 1e24).toFixed(1)}Sp`; // Septillion
  if (absV >= 1e21) return `${sign}${c}${(absV / 1e21).toFixed(1)}Sx`; // Sextillion
  if (absV >= 1e18) return `${sign}${c}${(absV / 1e18).toFixed(1)}Qi`; // Quintillion
  if (absV >= 1e15) return `${sign}${c}${(absV / 1e15).toFixed(1)}Qa`; // Quadrillion
  if (absV >= 1e12) return `${sign}${c}${(absV / 1e12).toFixed(1)}T`; // Trillion
  if (absV >= 1e9)  return `${sign}${c}${(absV / 1e9).toFixed(1)}B`;  // Billion
  if (absV >= 1e6)  return `${sign}${c}${(absV / 1e6).toFixed(1)}M`;  // Million
  if (absV >= 1e3)  return `${sign}${c}${(absV / 1e3).toFixed(1)}K`;  // Thousand
  return `${sign}${c}${absV.toFixed(0)}`;
}

export function formatNumber(v: number) {
  const absV = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  
  if (absV >= 1e33) return `${sign}${(absV / 1e33).toFixed(1)}Dc`;
  if (absV >= 1e30) return `${sign}${(absV / 1e30).toFixed(1)}No`;
  if (absV >= 1e27) return `${sign}${(absV / 1e27).toFixed(1)}Oc`;
  if (absV >= 1e24) return `${sign}${(absV / 1e24).toFixed(1)}Sp`;
  if (absV >= 1e21) return `${sign}${(absV / 1e21).toFixed(1)}Sx`;
  if (absV >= 1e18) return `${sign}${(absV / 1e18).toFixed(1)}Qi`;
  if (absV >= 1e15) return `${sign}${(absV / 1e15).toFixed(1)}Qa`;
  if (absV >= 1e12) return `${sign}${(absV / 1e12).toFixed(1)}T`;
  if (absV >= 1e9)  return `${sign}${(absV / 1e9).toFixed(1)}B`;
  if (absV >= 1e6)  return `${sign}${(absV / 1e6).toFixed(1)}M`;
  if (absV >= 1e3)  return `${sign}${(absV / 1e3).toFixed(1)}K`;
  return `${sign}${absV.toLocaleString()}`;
}
