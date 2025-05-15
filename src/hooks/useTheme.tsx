
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Use the theme already set in main.tsx for instant UI
  const [theme, setTheme] = useState<Theme>(() => {
    const root = window.document.documentElement;
    return root.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    // Update theme attribute on document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, [theme]);

  return { theme, setTheme };
}
