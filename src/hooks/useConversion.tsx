
import { useState, useEffect, useRef } from 'react';
import { Currency, CoinRates } from '@/types/currency.types';
import { fetchCoinRates } from '@/services/coinGeckoApi';
import { convertCurrency, getCachedRates, canRefreshRates } from '@/services/ratesService';
import { useToast } from '@/hooks/use-toast';

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const lastRefreshTime = useRef<number>(0);
  const { toast } = useToast();

  // Fetch rates initially when component mounts
  useEffect(() => {
    fetchRates();
  }, []);

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

  const shouldRefreshRates = (): boolean => {
    const currentTime = Date.now();
    const timeSinceLastRefresh = currentTime - lastRefreshTime.current;
    return timeSinceLastRefresh >= 60000; // 60 seconds
  };

  const fetchRates = async () => {
    if (!shouldRefreshRates() && rates !== null) {
      console.log('Skipping API call - using cached rates (< 60s since last refresh)');
      return;
    }
    
    setIsRefreshing(true);
    try {
      const newRates = await fetchCoinRates();
      setRates(newRates);
      lastRefreshTime.current = Date.now();
      
      // If rates weren't set before, calculate initial conversions
      if (!rates) {
        const numericAmount = parseFloat(amount);
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
      
      toast({
        title: "Currency Rates Updated",
        description: "Rates will auto-refresh after 60 seconds of inactivity.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      
      // If API fails but we have cached rates, use those
      if (!rates) {
        const cachedRates = getCachedRates();
        setRates(cachedRates);
      }
      
      toast({
        title: "Oops! Rate update failed",
        description: "We couldn't update the rates. Please check your connection.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    
    // Only update rates if it's been more than 60 seconds
    if (shouldRefreshRates()) {
      fetchRates();
    }
    
    if (rates) {
      // When changing currency, convert the current amount to the new currency
      const numericAmount = parseFloat(amount) || 0;
      const newConversions = convertCurrency(numericAmount, currency, rates);
      setConversions(newConversions);
    }
  };

  const handleInputChange = (value: string) => {
    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      
      // Only fetch new rates if value is not empty and it's been over 60 seconds
      if (value !== '' && shouldRefreshRates()) {
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
  };
};
