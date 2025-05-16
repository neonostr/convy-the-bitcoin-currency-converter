
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // For PWA, always use dark theme initially for immediate UI rendering
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'dark'; // Default to dark in PWA mode for immediate rendering
    }
    
    // For browser mode, we can afford to check localStorage
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) return savedTheme;
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    
    // Default to dark theme
    return 'dark';
  });

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    // Update theme attribute on document - do it synchronously for PWA
    if (isPWA) {
      // For PWA, update theme immediately
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    } else {
      // For browser, can use the normal flow
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    // Save to localStorage - defer this for PWA to prioritize rendering
    if (isPWA) {
      setTimeout(() => {
        try {
          localStorage.setItem('theme', theme);
        } catch (e) {
          console.error("Error writing to localStorage:", e);
        }
      }, 1000); // Significant delay for PWA
    } else {
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {
        console.error("Error writing to localStorage:", e);
      }
    }
  }, [theme]);

  return { theme, setTheme };
}
