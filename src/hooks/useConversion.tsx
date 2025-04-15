
import { useState, useEffect } from 'react';
import { Currency } from '@/types/currency.types';
import { convertCurrency, isCacheStale } from '@/services/ratesService';
import { useSettings } from '@/hooks/useSettings';
import { logEvent } from '@/services/usageTracker';
import { useAmount } from './useAmount';
import { useRates } from './useRates';

export const useConversion = () => {
  const { amount, setAmount, handleInputChange } = useAmount();
  const { rates, isRefreshing, fetchRates } = useRates();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const { settings } = useSettings();

  // Initial fetch on mount only if cache is stale
  useEffect(() => {
    if (isCacheStale()) {
      console.log('Cache is stale, fetching fresh rates on mount');
      fetchRates();
    } else {
      console.log('Cache is fresh, using cached rates on mount');
    }
  }, []);

  // Update conversions when amount, selected currency, or rates change
  useEffect(() => {
    if (rates && amount !== '') {
      const normalizedAmount = amount.replace(',', '.');
      const numericAmount = parseFloat(normalizedAmount);
      
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, rates);
        setConversions(newConversions);
      } else {
        setConversions({});
      }
    }
  }, [amount, selectedCurrency, rates]);

  // Update conversions when settings change
  useEffect(() => {
    if (rates && amount !== '') {
      const normalizedAmount = amount.replace(',', '.');
      const numericAmount = parseFloat(normalizedAmount);
      
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, rates);
        setConversions(newConversions);
      }
    }
  }, [settings]);

  const handleCurrencySelect = async (currency: Currency) => {
    setSelectedCurrency(currency);
    await logEvent(`currency_selected_${currency}`);
    
    setAmount('0');
    
    // Only fetch rates if cache is stale
    if (isCacheStale()) {
      console.log('Cache is stale, fetching fresh rates on currency change');
      fetchRates();
    } else {
      console.log('Cache is fresh, using cached rates on currency change');
    }
    
    if (rates) {
      const newConversions = convertCurrency(0, currency, rates);
      setConversions(newConversions);
    }
  };

  return {
    amount,
    setAmount,
    selectedCurrency,
    rates,
    conversions,
    setConversions,
    isRefreshing,
    handleCurrencySelect,
    handleInputChange,
    fetchRates,
  };
};
