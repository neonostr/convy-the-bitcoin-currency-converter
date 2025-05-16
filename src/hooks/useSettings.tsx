
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
const APP_VERSION = '1.1.0'; // Reverted back to 1.1.0 as requested

// Create a context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Check if running as PWA - do this early for instant rendering in PWA mode
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  const [settings, setSettings] = useState<Settings>(() => {
    // For PWA, use simplified default settings to speed initial render
    if (isPWA) {
      return {
        theme: 'dark', // Dark theme by default for PWA
        displayCurrencies: DEFAULT_CURRENCIES,
        decimalSeparator: '.',
        includeThouSepWhenCopying: false,
        alwaysDefaultToBtc: false,
        showRateUpdateNotifications: true,
      };
    }
    
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
      theme: 'dark', // Dark theme by default
      displayCurrencies: DEFAULT_CURRENCIES,
      decimalSeparator: '.',
      includeThouSepWhenCopying: false,
      alwaysDefaultToBtc: false,
      showRateUpdateNotifications: true,
    };
  });

  useEffect(() => {
    // Save settings to localStorage whenever they change
    // For PWA, use a longer delay to prioritize initial rendering
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem('bitcoin-converter-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }, isPWA ? 1000 : 100); // Longer delay for PWA
    
    return () => clearTimeout(saveTimeout);
  }, [settings, isPWA]);

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
        appVersion: APP_VERSION // Using the reverted version number
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
