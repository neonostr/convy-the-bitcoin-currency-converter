
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const justUpdatedRef = useRef<boolean>(false);
  const updateAnimationTimeoutRef = useRef<number | null>(null);
  
  const { data: rates, isLoading, refetch } = useQuery({
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

  // Effect for handling rate updates with a guaranteed completion animation
  useEffect(() => {
    if (rates) {
      // Set the flag to show the update animation
      justUpdatedRef.current = true;
      
      // Clear any existing timeout
      if (updateAnimationTimeoutRef.current) {
        window.clearTimeout(updateAnimationTimeoutRef.current);
        updateAnimationTimeoutRef.current = null;
      }
      
      // Use window.setTimeout instead of Node's setTimeout for browser compatibility
      // and ensure it completes regardless of user activity
      updateAnimationTimeoutRef.current = window.setTimeout(() => {
        justUpdatedRef.current = false;
        updateAnimationTimeoutRef.current = null;
      }, 1000); // Very brief 1 second blink
    }
    
    return () => {
      if (updateAnimationTimeoutRef.current) {
        window.clearTimeout(updateAnimationTimeoutRef.current);
        updateAnimationTimeoutRef.current = null;
      }
    };
  }, [rates]);
  
  // Backup safety check that runs on a regular interval regardless of user interaction
  useEffect(() => {
    // Create an interval that runs every second to ensure animation doesn't get stuck
    const animationSafetyInterval = window.setInterval(() => {
      // If the animation is still showing but should have ended by now
      if (justUpdatedRef.current && rates?.lastUpdated) {
        const timeSinceUpdate = Date.now() - new Date(rates.lastUpdated).getTime();
        
        // If it's been more than 1.5 seconds since the update, force reset the animation
        if (timeSinceUpdate > 1500) {
          justUpdatedRef.current = false;
          
          if (updateAnimationTimeoutRef.current) {
            window.clearTimeout(updateAnimationTimeoutRef.current);
            updateAnimationTimeoutRef.current = null;
          }
        }
      }
    }, 1000); // Check every second - this ensures the animation can't get stuck for more than ~2 seconds
    
    return () => {
      window.clearInterval(animationSafetyInterval);
    };
  }, [rates]);

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
    isLoading,
    conversions,
    setConversions,
    handleCurrencySelect,
    handleInputChange,
    recordUserActivity,
    setDefaultBtcValue,
    justUpdated: justUpdatedRef
  };
};
