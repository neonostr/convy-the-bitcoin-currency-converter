
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/types/currency.types';
import { useSettings } from './useSettings';
import { formatForCopy } from '@/utils/formatUtils';
import { useToast } from './use-toast';
import { logEvent } from '@/services/eventLogger';
import { trackApiCall } from '@/services/usageTracker';

// Base interface for currency rates without index signature
interface Rates {
  usd: number;
  eur: number;
  chf: number;
  gbp: number;
  cny: number;
  jpy: number;
  aud: number;
  cad: number;
  inr: number;
  rub: number;
}

// Extended interface that includes lastUpdated
interface RatesWithDate extends Rates {
  lastUpdated: Date;
}

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,gbp,cny,jpy,aud,cad,inr,rub&include_last_updated_at=true';

const fetchRates = async (): Promise<RatesWithDate> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  // Track API call
  trackApiCall();

  // Transform the data to match the Rates interface
  const rates: RatesWithDate = {
    usd: data.bitcoin.usd,
    eur: data.bitcoin.eur,
    chf: data.bitcoin.chf,
    gbp: data.bitcoin.gbp,
    cny: data.bitcoin.cny,
    jpy: data.bitcoin.jpy,
    aud: data.bitcoin.aud,
    cad: data.bitcoin.cad,
    inr: data.bitcoin.inr,
    rub: data.bitcoin.rub,
    lastUpdated: new Date(data.bitcoin.last_updated_at * 1000), // Convert seconds to milliseconds
  };

  return rates;
};

export const useConversion = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const { settings } = useSettings();
  const { toast } = useToast();
  
  const { data: rates, refetch } = useQuery({
    queryKey: ['rates'],
    queryFn: fetchRates,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    meta: {
      onError: (error: Error) => {
        console.error("Failed to fetch rates:", error);
      }
    }
  });

  useEffect(() => {
    const storedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    if (storedCurrency) {
      setSelectedCurrency(storedCurrency);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

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
          newConversions[currency] = numAmount * rates[currency as keyof Rates];
        }
      });
    } else if (selectedCurrency === 'sats') {
      newConversions['btc'] = numAmount / 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated') {
          newConversions[currency] = (numAmount / 100000000) * rates[currency as keyof Rates];
        }
      });
    }
    else {
      newConversions['btc'] = numAmount / rates[selectedCurrency as keyof Rates];
      newConversions['sats'] = (numAmount / rates[selectedCurrency as keyof Rates]) * 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated' && currency !== selectedCurrency) {
          newConversions[currency] = numAmount / rates[selectedCurrency as keyof Rates] * rates[currency as keyof Rates];
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

  // Effect for handling rate updates
  useEffect(() => {
    if (rates) {
      // Log the rate update event to Supabase
      const apiType = rates.usd > 0 ? 'coingecko_api_public_success' : 'cached_data_provided';
      logEvent(apiType);
      
      toast({
        title: "Currency Rates Updated",
        description: "Auto-updates each minute when activity is detected.",
        duration: 3000,
      });
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
