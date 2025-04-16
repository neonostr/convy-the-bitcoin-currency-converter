import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Currency, CoinRates } from '@/types/currency.types';
import { useSettings } from './useSettings';
import { useToast } from './use-toast';
import { logEvent } from '@/services/eventLogger';
import { trackApiCall } from '@/services/usageTracker';
import { fetchCoinRates } from '@/services/coinGeckoApi';

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const { settings } = useSettings();
  const { toast } = useToast();
  const lastToastTime = useRef<number>(0);
  const MIN_TOAST_INTERVAL = 30000; // 30 seconds between toasts
  
  const { data: rates, refetch } = useQuery({
    queryKey: ['rates'],
    queryFn: fetchCoinRates,
    refetchInterval: 60000, // Back to 60 seconds as requested (reduced from 120s)
    staleTime: 60000, // Consider data stale after 1 minute
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce API calls
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

  // Calculate conversions whenever amount, currency or rates change
  const convert = useCallback(() => {
    if (!amount || !rates) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return;
    }

    const newConversions: Record<string, number> = {};

    if (selectedCurrency === 'btc') {
      newConversions['sats'] = numAmount * 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated') {
          newConversions[currency] = numAmount * rates[currency as keyof Omit<CoinRates, 'lastUpdated'>];
        }
      });
    } else if (selectedCurrency === 'sats') {
      newConversions['btc'] = numAmount / 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated') {
          newConversions[currency] = (numAmount / 100000000) * rates[currency as keyof Omit<CoinRates, 'lastUpdated'>];
        }
      });
    }
    else {
      newConversions['btc'] = numAmount / rates[selectedCurrency as keyof Omit<CoinRates, 'lastUpdated'>];
      newConversions['sats'] = (numAmount / rates[selectedCurrency as keyof Omit<CoinRates, 'lastUpdated'>]) * 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated' && currency !== selectedCurrency) {
          newConversions[currency] = numAmount / rates[selectedCurrency as keyof Omit<CoinRates, 'lastUpdated'>] * rates[currency as keyof Omit<CoinRates, 'lastUpdated'>];
        }
      });
    }

    setConversions(newConversions);
  }, [amount, selectedCurrency, rates]);

  useEffect(() => {
    convert();
  }, [convert]);

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    convert();
  };

  const handleInputChange = (value: string) => {
    // Allow only numbers and a single decimal separator
    const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(/(\..*)\./g, '$1').replace(/(,.*),/g, '$1');

    setAmount(sanitizedValue);
  };

  // Effect for handling rate updates - but limit toast frequency
  useEffect(() => {
    if (rates) {
      // Only show toast if enough time has passed since the last one
      const now = Date.now();
      if (now - lastToastTime.current > MIN_TOAST_INTERVAL) {
        toast({
          title: "Currency Rates Updated",
          description: "Auto-updates every 60 seconds when activity is detected.",
          duration: 3000,
        });
        lastToastTime.current = now;
      }
    }
  }, [rates, toast]);

  return {
    amount,
    setAmount,
    selectedCurrency,
    rates,
    conversions,
    setConversions,
    handleCurrencySelect,
    handleInputChange
  };
};
