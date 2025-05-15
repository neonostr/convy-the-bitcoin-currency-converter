
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Don't block initial render by accessing localStorage
  // Use the theme already set in main.tsx for instant UI
  const [theme, setTheme] = useState<Theme>(() => {
    const root = window.document.documentElement;
    return root.classList.contains('dark') ? 'dark' : 'light';
  });

  // Apply theme changes after initial render
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage in a non-blocking way
    setTimeout(() => {
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {
        console.error('Failed to save theme to localStorage', e);
      }
    }, 0);
  }, [theme]);

  return { theme, setTheme };
}
