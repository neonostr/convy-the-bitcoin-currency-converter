
import { useState, useRef, useEffect } from 'react';
import { CoinRates } from '@/types/currency.types';
import { fetchCoinRates } from '@/services/coinGeckoApi';
import { useToast } from '@/hooks/use-toast';
import { getCachedRates } from '@/services/ratesService';
import { logEvent } from '@/services/usageTracker';

export const useRates = () => {
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const lastManualFetchTimestamp = useRef<number>(0);
  const fetchController = useRef<AbortController | null>(null);
  const initialFetchDone = useRef<boolean>(false);

  // Initialize rates from client-side cache on mount
  useEffect(() => {
    // Check if we have valid cached rates and set them
    if (!initialFetchDone.current) {
      const cachedRates = getCachedRates();
      if (cachedRates && Object.keys(cachedRates).length > 0) {
        console.log('Initializing with cached rates');
        setRates(cachedRates);
        initialFetchDone.current = true;
      }
    }
  }, []);

  const fetchRates = async (forceRefresh = false) => {
    if (fetchController.current) {
      fetchController.current.abort();
    }
    
    fetchController.current = new AbortController();
    
    const now = Date.now();
    if (forceRefresh && now - lastManualFetchTimestamp.current < 30000) {
      toast({
        title: "Please wait",
        description: "You can refresh rates again in a few seconds.",
        duration: 3000,
      });
      
      try {
        await logEvent('refresh_rates_throttled');
      } catch (error) {
        console.warn('Failed to log throttle event:', error);
      }
      return;
    }
    
    if (forceRefresh) {
      lastManualFetchTimestamp.current = now;
      try {
        await logEvent('manual_refresh_rates');
      } catch (error) {
        console.warn('Failed to log manual refresh event:', error);
      }
    }
    
    setIsRefreshing(true);
    try {
      console.log('Fetching rates, forceRefresh:', forceRefresh);
      const newRates = await fetchCoinRates();
      setRates(newRates);
      initialFetchDone.current = true;
      
      if (forceRefresh) {
        toast({
          title: "Currency Rates Updated",
          description: "Latest exchange rates have been fetched.",
          duration: 3000,
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch rates:', error);
        try {
          await logEvent('conversion_fetch_error');
        } catch (loggingError) {
          console.warn('Failed to log fetch error event:', loggingError);
        }
        
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

  return {
    rates,
    isRefreshing,
    fetchRates,
  };
};
