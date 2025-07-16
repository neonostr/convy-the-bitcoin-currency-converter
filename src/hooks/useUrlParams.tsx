import { useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';
import { Currency } from '@/types/currency.types';

interface UrlParams {
  base?: Currency;
  currencies?: Currency[];
}

export const useUrlParams = (selectedCurrency?: Currency, onCurrencySelect?: (currency: Currency) => void) => {
  const { settings, updateDisplayCurrencies } = useSettings();
  
  // Parse URL parameters on component mount only
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const base = urlParams.get('base') as Currency;
    const currenciesParam = urlParams.get('currencies');

    if (base && isValidCurrency(base) && onCurrencySelect) {
      onCurrencySelect(base);
    }

    if (currenciesParam) {
      const currencies = currenciesParam.split(',').filter(isValidCurrency) as Currency[];
      if (currencies.length >= 2) {
        updateDisplayCurrencies(currencies);
      }
    }
  }, []); // Only run once on mount

  // Generate shareable URL based on current settings
  const generateShareableUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    if (selectedCurrency) {
      params.set('base', selectedCurrency);
    }
    params.set('currencies', settings.displayCurrencies.join(','));
    
    return `${baseUrl}?${params.toString()}`;
  }, [selectedCurrency, settings.displayCurrencies]);

  return {
    generateShareableUrl
  };
};

// Helper function to validate currency
const isValidCurrency = (currency: string): currency is Currency => {
  const validCurrencies: Currency[] = [
    'btc', 'sats', 'usd', 'eur', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'chf', 'inr', 'rub',
    'sek', 'nzd', 'krw', 'sgd', 'nok', 'mxn', 'brl', 'hkd', 'try', 'pln', 'zar'
  ];
  return validCurrencies.includes(currency as Currency);
};