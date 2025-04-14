
import { useState, useEffect } from 'react';

export type Currency = 'btc' | 'sats' | 'usd' | 'eur' | 'chf' | 'cny' | 'jpy' | 'gbp' | 'aud' | 'cad' | 'inr' | 'rub';

export interface Settings {
  theme: 'light' | 'dark';
  displayCurrencies: Currency[];
  draftDisplayCurrencies?: Currency[]; // Added for live preview
}

const DEFAULT_CURRENCIES: Currency[] = ['btc', 'sats', 'usd', 'eur', 'chf', 'gbp'];
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
    updateSettings({ displayCurrencies: currencies, draftDisplayCurrencies: undefined });
  };

  // New function to update draft currencies for live preview
  const updateDraftCurrencies = (currencies: Currency[]) => {
    updateSettings({ draftDisplayCurrencies: currencies });
  };

  // New function to cancel draft changes
  const cancelDraftChanges = () => {
    updateSettings({ draftDisplayCurrencies: undefined });
  };

  return {
    settings,
    updateSettings,
    toggleTheme,
    updateDisplayCurrencies,
    updateDraftCurrencies,
    cancelDraftChanges,
    allCurrencies: ALL_CURRENCIES,
  };
};
