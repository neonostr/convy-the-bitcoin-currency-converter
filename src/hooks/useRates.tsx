
import { useState, useRef } from 'react';
import { CoinRates } from '@/types/currency.types';
import { fetchCoinRates } from '@/services/coinGeckoApi';
import { useToast } from '@/hooks/use-toast';
import { isCacheStale } from '@/services/ratesService';
import { logEvent } from '@/services/usageTracker';

export const useRates = () => {
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();
  const lastManualFetchTimestamp = useRef<number>(0);
  const fetchController = useRef<AbortController | null>(null);
  const initialFetchDone = useRef<boolean>(false);

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
      
      await logEvent('refresh_rates_throttled');
      return;
    }
    
    if (!forceRefresh && !initialFetchDone.current && !isCacheStale() && rates !== null) {
      console.log('Using cached rates - skipping API call');
      await logEvent('conversion_used_cached_data');
      return;
    }
    
    if (forceRefresh) {
      lastManualFetchTimestamp.current = now;
      await logEvent('manual_refresh_rates');
    }
    
    setIsRefreshing(true);
    try {
      console.log('Fetching rates, isInitialFetch:', initialFetchDone.current, 'forceRefresh:', forceRefresh);
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
        await logEvent('conversion_fetch_error');
        
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
