
import { useState, useEffect, useRef, useCallback } from 'react';
import { Currency, CoinRates } from '@/types/currency.types';
import { fetchCoinRates } from '@/services/coinGeckoApi';
import { convertCurrency, getCachedRates, isCacheStale, initialRates } from '@/services/ratesService';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('1'); // Initialize with '1'
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc'); // Initialize with 'btc'
  const [rates, setRates] = useState<CoinRates>({ ...initialRates });
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Initialize the converter with 1 BTC on first load
  useEffect(() => {
    handleInputChange('1');
  }, []);

  const fetchRates = async () => {
    if (!isCacheStale() && rates !== null) {
      console.log('Using cached rates (< 60s old)');
      return;
    }
    
    setIsRefreshing(true);
    try {
      const newRates = await fetchCoinRates();
      setRates({ ...newRates });
      
      // Recalculate conversions with new rates if there's a valid amount
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
        setConversions(newConversions);
      }
      
      if (isCacheStale()) {
        toast({
          title: "Currency Rates Updated",
          description: "Latest exchange rates have been fetched.",
          duration: 3000,
        });
      }
      
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      const cachedRates = getCachedRates();
      setRates({ ...cachedRates });
      
      toast({
        title: "Oops! Rate update failed",
        description: "We're using cached rates. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCurrencySelect = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
    
    // Clear input and reset conversions
    setAmount('');
    setConversions({});
    
    // Only update rates if cache is stale
    if (isCacheStale()) {
      fetchRates();
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      
      // Convert immediately for UI feedback
      const numericAmount = parseFloat(value) || 0;
      const newConversions = convertCurrency(numericAmount, selectedCurrency, rates);
      setConversions(newConversions);
      
      // Set up debounced rate fetch (15 seconds)
      debounceTimerRef.current = setTimeout(() => {
        if (value !== '' && isCacheStale()) {
          fetchRates();
        }
      }, 15000);
    }
  }, [selectedCurrency, rates]);

  return {
    amount,
    setAmount,
    selectedCurrency,
    rates,
    conversions,
    isRefreshing,
    handleCurrencySelect,
    handleInputChange,
    refreshRates: fetchRates,
  };
};
