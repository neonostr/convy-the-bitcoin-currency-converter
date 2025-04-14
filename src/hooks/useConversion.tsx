
import { useState, useEffect } from 'react';
import { Currency, CoinRates } from '@/types/currency.types';
import { fetchCoinRates, convertCurrency, canRefreshRates } from '@/services/coingeckoService';
import { useToast } from '@/hooks/use-toast';

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [canRefresh, setCanRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchRates();
    
    const refreshCheckInterval = setInterval(() => {
      setCanRefresh(canRefreshRates());
    }, 5000);
    
    return () => {
      clearInterval(refreshCheckInterval);
    };
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

  useEffect(() => {
    let timer: number | null = null;
    
    if (refreshCountdown > 0) {
      timer = window.setInterval(() => {
        setRefreshCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [refreshCountdown]);

  useEffect(() => {
    if (canRefresh && rates !== null) {
      fetchRates();
    }
  }, [selectedCurrency]);

  const fetchRates = async () => {
    if (!canRefresh) return;
    
    setIsRefreshing(true);
    try {
      const newRates = await fetchCoinRates();
      setRates(newRates);
      setCanRefresh(false);
      setRefreshCountdown(60);
      
      if (!rates) {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
          const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
          setConversions(newConversions);
        }
      }
      
      toast({
        title: "Currency Rates Updated",
        description: "I'll auto-refresh when you convert again - up to every 60 seconds.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      toast({
        title: "Oops! Rate update failed",
        description: "We couldn't update the rates. Please check your connection.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
      
      setTimeout(() => {
        setCanRefresh(canRefreshRates());
      }, 5000);
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setAmount('');
    
    if (rates) {
      const zeroConversions = convertCurrency(0, currency, rates);
      setConversions(zeroConversions);
    }
  };

  const handleInputChange = (value: string) => {
    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      
      if (canRefresh && value !== '') {
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
