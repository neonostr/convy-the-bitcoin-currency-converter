
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Apply theme immediately with direct DOM manipulation - before any React rendering
  // This ensures there's no flash of incorrect theme or delay
  const applyThemeImmediately = () => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme || 'dark'; // Default to dark
    
    if (typeof document !== 'undefined') {
      // Apply class AND inline styles for immediate visual effect
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initialTheme);
      
      // Apply critical colors directly as inline styles for instant rendering
      // This bypasses the CSS loading delay
      if (initialTheme === 'dark') {
        document.documentElement.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
        document.documentElement.style.color = 'hsl(210 40% 98%)';
      } else {
        document.documentElement.style.backgroundColor = 'hsl(0 0% 100%)';
        document.documentElement.style.color = 'hsl(240 10% 3.9%)';
      }
    }
    return initialTheme;
  };

  // Apply theme immediately during module execution - this runs before React rendering
  const initialTheme = applyThemeImmediately();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // This effect handles theme changes after the initial render
  useEffect(() => {
    // Only apply changes if the theme actually changed from initial
    if (theme !== initialTheme) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      
      // Apply critical colors directly for immediate effect
      if (theme === 'dark') {
        root.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
        root.style.color = 'hsl(210 40% 98%)';
      } else {
        root.style.backgroundColor = 'hsl(0 0% 100%)';
        root.style.color = 'hsl(240 10% 3.9%)';
      }
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme, initialTheme]);

  return { theme, setTheme };
}
