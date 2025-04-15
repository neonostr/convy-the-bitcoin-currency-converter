
import { useState, useEffect, useRef } from 'react';
import { Currency, CoinRates } from '@/types/currency.types';
import { fetchCoinRates, logInitialRatesState } from '@/services/coinGeckoApi';
import { convertCurrency, getCachedRates, isCacheStale, initialRates } from '@/services/ratesService';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [rates, setRates] = useState<CoinRates>({ ...initialRates });
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const isInitialFetch = useRef<boolean>(true);

  // Debug log the initial rates when component mounts
  useEffect(() => {
    console.log('useConversion hook initialized with initialRates:', { ...initialRates });
    logInitialRatesState();
  }, []);

  // Fetch rates initially when component mounts
  useEffect(() => {
    fetchRates();
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

  // Update conversions when settings change (to reflect any changes in display currencies)
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

  const fetchRates = async () => {
    // For initial fetch, always try to get fresh data
    // For subsequent fetches, only fetch if the cache is stale (> 60s)
    if (!isInitialFetch.current && !isCacheStale() && rates !== null) {
      console.log('Skipping API call - using cached rates (< 60s old)');
      return;
    }
    
    setIsRefreshing(true);
    try {
      console.log('Fetching new rates...');
      const newRates = await fetchCoinRates();
      console.log('Received new rates:', newRates);
      
      // Important: Set the component state with a NEW object to trigger re-render
      setRates({ ...newRates });
      
      isInitialFetch.current = false;
      
      // Recalculate conversions with new rates
      const normalizedAmount = amount.replace(',', '.');
      const numericAmount = parseFloat(normalizedAmount);
      
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
        setConversions(newConversions);
      }
      
      // Only show a toast notification if we actually fetched fresh data from the API
      if (isCacheStale()) {
        toast({
          title: "Currency Rates Updated",
          description: "Latest exchange rates have been fetched.",
          duration: 3000,
        });
      }
      
      // Log the current state of initialRates after the fetch
      console.log('initialRates after fetch:', { ...initialRates });
      logInitialRatesState();
      
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      
      // If API fails but we have cached rates, use those
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

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    
    // Only update rates if cache is stale
    if (isCacheStale()) {
      fetchRates();
    }
    
    // When changing currency, convert the current amount to the new currency
    const numericAmount = parseFloat(amount) || 0;
    const newConversions = convertCurrency(numericAmount, currency, rates);
    setConversions(newConversions);
  };

  const handleInputChange = (value: string) => {
    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      
      // Only fetch new rates if value is not empty and the cache is stale
      if (value !== '' && isCacheStale()) {
        fetchRates();
      }
    }
  };

  return {
    amount,
    setAmount,
    selectedCurrency,
    rates,
    conversions,
    isRefreshing,
    handleCurrencySelect,
    handleInputChange,
    refreshRates: fetchRates, // Export the fetchRates function to allow manual refresh
  };
};
