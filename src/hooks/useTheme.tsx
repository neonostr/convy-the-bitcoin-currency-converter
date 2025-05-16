
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Check if running as PWA - used for optimizations
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  // For PWA, we always start with dark theme and don't check localStorage
  // This ensures immediate rendering without any flicker
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Only in browser mode, try to load theme from localStorage after initial render
  useEffect(() => {
    if (!isPWA) {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (e) {
        console.error("Error accessing localStorage:", e);
      }
    }
  }, [isPWA]);

  useEffect(() => {
    // For PWA, update DOM synchronously without any delay
    if (isPWA) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      
      // Save to localStorage with a delay for PWA to prioritize rendering
      setTimeout(() => {
        try {
          localStorage.setItem('theme', theme);
        } catch (e) {
          console.error("Error writing to localStorage:", e);
        }
      }, 1000);
    } else {
      // For browser, normal flow is fine
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {
        console.error("Error writing to localStorage:", e);
      }
    }
  }, [theme, isPWA]);

  return { theme, setTheme };
}
