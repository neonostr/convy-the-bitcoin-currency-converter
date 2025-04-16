import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/types/currency.types';
import { useSettings } from './useSettings';
import { formatForCopy } from '@/utils/formatUtils';

interface Rates {
  [currency: string]: number;
  lastUpdated: Date;
}

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,gbp,cny,jpy,aud,cad,inr,rub&include_last_updated_at=true';

const fetchRates = async (): Promise<Rates> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  // Transform the data to match the Rates interface
  const rates: Rates = {
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
  const { data: rates, refetch } = useQuery({
    queryKey: ['rates'],
    queryFn: fetchRates,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    onError: (error) => {
      console.error("Failed to fetch rates:", error);
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
          newConversions[currency] = numAmount * rates[currency];
        }
      });
    } else if (selectedCurrency === 'sats') {
      newConversions['btc'] = numAmount / 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated') {
          newConversions[currency] = (numAmount / 100000000) * rates[currency];
        }
      });
    }
    else {
      newConversions['btc'] = numAmount / rates[selectedCurrency];
      newConversions['sats'] = (numAmount / rates[selectedCurrency]) * 100000000;
      Object.keys(rates).forEach(currency => {
        if (currency !== 'lastUpdated' && currency !== selectedCurrency) {
          newConversions[currency] = numAmount / rates[selectedCurrency] * rates[currency];
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

  // Update the toast message for currency rates update
  export const handleRatesUpdate = (rates: Rates, toast: any) => {
    if (rates) {
      toast({
        title: "Currency Rates Updated",
        description: "Auto-updates each minute when activity is detected.",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (rates) {
      // @ts-ignore
      handleRatesUpdate(rates, useToast().toast);
    }
  }, [rates]);

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
