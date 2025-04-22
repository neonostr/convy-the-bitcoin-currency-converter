import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Currency, CoinRates } from '@/types/currency.types';
import { useSettings } from './useSettings';
import { useToast } from './use-toast';
import { fetchCoinRates } from '@/services/coinGeckoApi';
import { useActivity } from './useActivity';
import { useConversionCalculator } from './useConversionCalculator';
import { useLanguage } from './useLanguage';

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const { settings } = useSettings();
  const { toast } = useToast();
  const { userActive, recordUserActivity, shouldRefetch, lastToastTime } = useActivity();
  const { t } = useLanguage();
  const MIN_TOAST_INTERVAL = 30000; // 30 seconds between toasts
  
  const { data: rates, refetch } = useQuery({
    queryKey: ['rates'],
    queryFn: fetchCoinRates,
    refetchInterval: (data) => shouldRefetch() ? 60000 : false, // Only refetch every 60s if user is active
    staleTime: 60000, // Consider data stale after 1 minute
    refetchOnWindowFocus: (query) => {
      // When window regains focus, check if user is active and enough time has passed
      const timeSinceLastFetch = query.state.dataUpdatedAt 
        ? Date.now() - query.state.dataUpdatedAt 
        : Infinity;
      
      // Only refetch on focus if data is older than 60 seconds and user is active
      return timeSinceLastFetch > 60000 && shouldRefetch();
    },
    meta: {
      onError: (error: Error) => {
        console.error("Failed to fetch rates:", error);
      }
    }
  });

  // Load saved currency preference
  useEffect(() => {
    const storedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    if (storedCurrency) {
      setSelectedCurrency(storedCurrency);
    }
  }, []);

  // Save currency preference
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Use the conversion calculator
  const convert = useConversionCalculator(amount, selectedCurrency, rates, setConversions);

  // Calculate conversions whenever amount, currency or rates change
  useEffect(() => {
    convert();
  }, [convert]);

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    recordUserActivity();
    convert();
  };

  const handleInputChange = (value: string) => {
    // Allow only numbers and a single decimal separator (both . and ,)
    const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(/(\..*)\./g, '$1').replace(/(,.*),/g, '$1');
    recordUserActivity();
    setAmount(sanitizedValue);
  };

  // Effect for handling rate updates - but limit toast frequency and don't show when in settings
  useEffect(() => {
    if (rates) {
      // Only show toast if enough time has passed since the last one
      // and if we're not in a sheet/modal (checking for body class)
      const now = Date.now();
      const isSheetOpen = document.querySelector('[role="dialog"]') !== null;
      
      // Never use any hardcoded fallback for toast, always use translation
      if (now - lastToastTime.current > MIN_TOAST_INTERVAL && !isSheetOpen) {
        toast({
          title: t('converter.ratesUpdated.title'), // translation key for every language
          description: t('converter.ratesUpdated.description'), // translation key
          duration: 3000,
        });
        lastToastTime.current = now;
      }
    }
  }, [rates, toast, lastToastTime, t]);

  // Trigger a refresh when activity is detected and data is stale
  useEffect(() => {
    if (userActive && rates?.lastUpdated) {
      const timeSinceLastUpdate = Date.now() - new Date(rates.lastUpdated).getTime();
      if (timeSinceLastUpdate > 60000) {
        refetch();
      }
    }
  }, [userActive, rates, refetch]);

  // Set BTC and amount=1 when the tracker is enabled and the app becomes active
  const setDefaultBtcValue = useCallback(() => {
    if (settings.alwaysDefaultToBtc) {
      setSelectedCurrency('btc');
      setAmount('1');
    }
  }, [settings.alwaysDefaultToBtc]);

  return {
    amount,
    setAmount,
    selectedCurrency,
    rates,
    conversions,
    setConversions,
    handleCurrencySelect,
    handleInputChange,
    recordUserActivity,
    setDefaultBtcValue
  };
};
