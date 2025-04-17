
import { useCallback } from 'react';
import { Currency, CoinRates } from '@/types/currency.types';

export const useConversionCalculator = (
  amount: string,
  selectedCurrency: Currency,
  rates: CoinRates | undefined,
  setConversions: (conversions: Record<string, number>) => void
) => {
  return useCallback(() => {
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
  }, [amount, selectedCurrency, rates, setConversions]);
};
