
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
const APP_VERSION = '1.0.0';

// Create a context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
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
      decimalSeparator: '.',  // Default to dot as separator
      includeThouSepWhenCopying: false, // Default to not including thousand separator when copying
      alwaysDefaultToBtc: false, // Default to off for the new setting
      showRateUpdateNotifications: true, // Default to showing notifications
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
