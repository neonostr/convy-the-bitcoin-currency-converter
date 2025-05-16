
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // For PWA, prioritize immediate UI render with default dark theme
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'dark'; // Default to dark in PWA mode for immediate rendering
    }
    
    // For browser mode, we can afford to check localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    // Default to dark mode instead of checking system preference
    return 'dark';
  });

  useEffect(() => {
    // Update theme attribute on document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
