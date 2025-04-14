
import { useState, useEffect } from 'react';

export type Currency = 'btc' | 'sats' | 'usd' | 'eur' | 'chf' | 'cny' | 'jpy' | 'gbp' | 'aud' | 'cad' | 'inr' | 'rub';

export interface Settings {
  theme: 'light' | 'dark';
  displayCurrencies: Currency[];
}

const DEFAULT_CURRENCIES: Currency[] = ['btc', 'sats', 'usd', 'eur', 'chf'];
const ALL_CURRENCIES: Currency[] = ['btc', 'sats', 'usd', 'eur', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'chf', 'inr', 'rub'];

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('bitcoin-converter-settings');
    
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
    
    // Default settings
    return {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      displayCurrencies: DEFAULT_CURRENCIES,
    };
  });

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('bitcoin-converter-settings', JSON.stringify(settings));
    
    // Update theme on document
    const { theme } = settings;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const updateDisplayCurrencies = (currencies: Currency[]) => {
    updateSettings({ displayCurrencies: currencies });
  };

  return {
    settings,
    updateSettings,
    toggleTheme,
    updateDisplayCurrencies,
    allCurrencies: ALL_CURRENCIES,
  };
};
