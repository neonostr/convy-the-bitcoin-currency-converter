
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
  const [userActive, setUserActive] = useState<boolean>(true);
  const { settings } = useSettings();
  const { toast } = useToast();
  const lastToastTime = useRef<number>(0);
  const lastActivityTime = useRef<number>(Date.now());
  const MIN_TOAST_INTERVAL = 30000; // 30 seconds between toasts
  
  // Mark user as active when this hook is first used
  useEffect(() => {
    lastActivityTime.current = Date.now();
    setUserActive(true);
    
    // Set up activity monitoring
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'focus', 'visibilitychange'];
    
    const handleUserActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime.current;
      
      // If it's been a while since the last activity, mark as newly active
      if (timeSinceLastActivity > 30000) { // 30 seconds of inactivity threshold
        console.log('User returned after inactivity');
      }
      
      lastActivityTime.current = now;
      setUserActive(true);
    };
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Set up visibility change detection
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('App became visible, marking user as active');
        handleUserActivity();
      }
    });
    
    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);
  
  // Function to determine if we should refetch based on activity
  const shouldRefetch = useCallback(() => {
    // Only refetch if the user has been active recently (within the last minute)
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime.current;
    
    // User must be active within the last minute to trigger a refetch
    const isRecentlyActive = timeSinceLastActivity < 60000;
    
    if (!isRecentlyActive) {
      console.log('Skipping refetch due to user inactivity');
      return false;
    }
    
    return true;
  }, []);
  
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

  // Register user activity when they change currency or input
  const recordUserActivity = () => {
    lastActivityTime.current = Date.now();
    setUserActive(true);
    
    // If it's been more than 60 seconds since the last data update, trigger a refresh
    if (rates?.lastUpdated) {
      const timeSinceLastUpdate = Date.now() - new Date(rates.lastUpdated).getTime();
      if (timeSinceLastUpdate > 60000) {
        console.log('User activity detected and data is stale, triggering refresh');
        refetch();
      }
    }
  };

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

    // Convert comma to dot for calculation while preserving display
    const normalizedAmount = amount.replace(',', '.');
    const numAmount = parseFloat(normalizedAmount);
    
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
    recordUserActivity();
    convert();
  };

  const handleInputChange = (value: string) => {
    // Allow only numbers and a single decimal separator (both . and ,)
    const sanitizedValue = value.replace(/[^0-9,.]/g, '').replace(/(\..*)\./g, '$1').replace(/(,.*),/g, '$1');
    recordUserActivity();
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
    handleInputChange,
    recordUserActivity  // Expose the activity recorder for other components
  };
};
