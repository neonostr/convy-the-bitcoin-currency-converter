
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Apply theme immediately - this ensures there's no flash of incorrect theme
  const savedTheme = localStorage.getItem('theme') as Theme;
  const initialTheme = savedTheme || 'dark'; // Default to dark
  
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);
  }

  const [theme, setTheme] = useState<Theme>(initialTheme);

  // This effect handles theme changes after the initial render
  useEffect(() => {
    // Only apply changes if the theme actually changed from initial
    if (theme !== initialTheme) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme, initialTheme]);

  return { theme, setTheme };
}
