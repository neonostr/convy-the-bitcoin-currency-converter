
import { useState } from 'react';
import { logEvent } from '@/services/usageTracker';

export const useAmount = () => {
  const getInitialAmount = () => {
    const savedAmount = localStorage.getItem('bitcoin-converter-default-amount');
    return savedAmount || '1';
  };

  const [amount, setAmount] = useState<string>(getInitialAmount());

  const handleInputChange = (value: string) => {
    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      localStorage.setItem('bitcoin-converter-default-amount', value);
    }
  };

  return {
    amount,
    setAmount,
    handleInputChange,
  };
};
