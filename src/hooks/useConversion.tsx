
import { useState, useEffect, useRef } from 'react';
import { Currency, CoinRates } from '@/types/currency.types';
import { fetchCoinRates } from '@/services/coinGeckoApi';
import { 
  convertCurrency, 
  getCachedRates,
  isCacheStale,
  initialRates 
} from '@/services/ratesService';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { logEvent } from '@/services/usageTracker';

export const useConversion = () => {
  const getInitialAmount = () => {
    // Try to get saved amount from localStorage, default to '1'
    const savedAmount = localStorage.getItem('bitcoin-converter-default-amount');
    return savedAmount || '1';
  };

  const [amount, setAmount] = useState<string>(getInitialAmount());
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const isInitialFetch = useRef<boolean>(true);
  const lastManualFetchTimestamp = useRef<number>(0);
  const fetchController = useRef<AbortController | null>(null);

  // Fetch rates initially when component mounts
  useEffect(() => {
    // Get initial rates
    fetchRates();
    
    // Initial conversion with default values
    if (rates) {
      const newConversions = convertCurrency(1, 'btc', rates);
      setConversions(newConversions);
    }
    
    // Cleanup function to abort any in-progress fetches when component unmounts
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, []);

  // Update conversions when amount, selected currency, or rates change
  useEffect(() => {
    if (rates && amount !== '') {
      // Correctly handle both comma and dot as decimal separators
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
      // Ensure consistent handling of decimal separators
      const normalizedAmount = amount.replace(',', '.');
      const numericAmount = parseFloat(normalizedAmount);
      
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, rates);
        setConversions(newConversions);
      }
    }
  }, [settings]);

  const fetchRates = async (forceRefresh = false) => {
    // Cancel any previous fetch
    if (fetchController.current) {
      fetchController.current.abort();
    }
    
    // Create new abort controller for this fetch
    fetchController.current = new AbortController();
    
    // Prevent too frequent manual refreshes (30 second cooldown)
    const now = Date.now();
    if (forceRefresh && now - lastManualFetchTimestamp.current < 30000) {
      toast({
        title: "Please wait",
        description: "You can refresh rates again in a few seconds.",
        duration: 3000,
      });
      
      await logEvent('refresh_rates_throttled');
      return;
    }
    
    // For initial fetch, always try to get fresh data if cache is stale
    // For subsequent fetches, only fetch if manually requested or cache is stale
    if (!forceRefresh && !isInitialFetch.current && !isCacheStale() && rates !== null) {
      console.log('Skipping API call - using cached rates (< 60s old)');
      await logEvent('conversion_used_cached_data');
      return;
    }
    
    if (forceRefresh) {
      lastManualFetchTimestamp.current = now;
      await logEvent('manual_refresh_rates');
    }
    
    setIsRefreshing(true);
    try {
      console.log('fetchCoinRates called, current initialRates:', initialRates);
      const newRates = await fetchCoinRates();
      setRates(newRates);
      isInitialFetch.current = false;
      
      // If this is the first time we're fetching rates, calculate initial conversions
      if (!rates) {
        // Ensure we handle comma decimal separators
        const normalizedAmount = amount.replace(',', '.');
        const numericAmount = parseFloat(normalizedAmount);
        if (!isNaN(numericAmount)) {
          const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
          setConversions(newConversions);
        }
      } else {
        // Recalculate conversions with new rates
        const normalizedAmount = amount.replace(',', '.');
        const numericAmount = parseFloat(normalizedAmount);
        
        if (!isNaN(numericAmount)) {
          const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
          setConversions(newConversions);
        }
      }
      
      // Only show a toast notification if we actually fetched fresh data from the API
      // and it was a manual refresh
      if (forceRefresh) {
        toast({
          title: "Currency Rates Updated",
          description: "Latest exchange rates have been fetched.",
          duration: 3000,
        });
      }
    } catch (error) {
      // Don't show error if it was just an abort
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch rates:', error);
        await logEvent('conversion_fetch_error');
        
        // If API fails but we have cached rates, use those
        if (!rates) {
          const cachedRates = getCachedRates();
          setRates(cachedRates);
          await logEvent('conversion_fallback_to_cache');
        }
        
        // Only show error toast for manual refreshes
        if (forceRefresh) {
          toast({
            title: "Oops! Rate update failed",
            description: "We're using cached rates. Please try again later.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCurrencySelect = async (currency: Currency) => {
    setSelectedCurrency(currency);
    await logEvent(`currency_selected_${currency}`);
    
    // Reset the amount to zero when changing currency
    setAmount('0');
    
    // Only update rates if cache is stale
    if (isCacheStale()) {
      fetchRates();
    }
    
    if (rates) {
      // When changing currency, set conversions to zero
      const newConversions = convertCurrency(0, currency, rates);
      setConversions(newConversions);
    }
  };

  const handleInputChange = (value: string) => {
    // Allow both comma and dot as decimal separators
    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      // Save to localStorage
      localStorage.setItem('bitcoin-converter-default-amount', value);
      
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
    setConversions,
    isRefreshing,
    handleCurrencySelect,
    handleInputChange,
    fetchRates, // Expose fetchRates with forceRefresh parameter
  };
};
