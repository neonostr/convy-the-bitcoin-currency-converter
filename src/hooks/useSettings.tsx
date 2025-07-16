import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Currency } from '@/types/currency.types';

export interface Settings {
  theme: 'light' | 'dark';
  displayCurrencies: Currency[];
  decimalSeparator: '.' | ',';
  includeThouSepWhenCopying: boolean;
  alwaysDefaultToBtc: boolean;
  showRateUpdateNotifications: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  toggleTheme: () => void;
  updateDisplayCurrencies: (currencies: Currency[]) => void;
  allCurrencies: Currency[];
  appVersion: string;
}

const DEFAULT_CURRENCIES: Currency[] = ['btc', 'sats', 'usd', 'eur', 'chf', 'gbp'];
const ALL_CURRENCIES: Currency[] = [
  'btc', 'sats', 'usd', 'eur', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'chf', 'inr', 'rub',
  'sek', 'nzd', 'krw', 'sgd', 'nok', 'mxn', 'brl', 'hkd', 'try', 'pln', 'zar'
];
const APP_VERSION = '1.2.1';

// Create a context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Try-catch to prevent any localStorage errors from blocking UI rendering
    try {
      const savedSettings = localStorage.getItem('bitcoin-converter-settings');
      
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Failed to parse saved settings:', error);
    }
    
    // Default settings - simplified for faster loading
    return {
      theme: 'dark', // Changed default theme to dark
      displayCurrencies: DEFAULT_CURRENCIES,
      decimalSeparator: '.',
      includeThouSepWhenCopying: false,
      alwaysDefaultToBtc: false,
      showRateUpdateNotifications: true,
    };
  });

  useEffect(() => {
    // Save settings to localStorage whenever they change - but defer this operation
    setTimeout(() => {
      try {
        localStorage.setItem('bitcoin-converter-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }, 100);
    
    // Update theme on document - this is actually handled earlier in main.tsx now
    // but we'll keep it here as a fallback
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
    if (currencies.length >= 2) {
      updateSettings({ displayCurrencies: currencies });
    }
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        toggleTheme, 
        updateDisplayCurrencies, 
        allCurrencies: ALL_CURRENCIES,
        appVersion: APP_VERSION
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Hook for using the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
