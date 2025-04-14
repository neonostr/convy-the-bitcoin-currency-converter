
import React from 'react';
import { Currency } from '@/types/currency.types';

interface CurrencySelectorProps {
  displayCurrencies: Currency[];
  selectedCurrency: Currency;
  onCurrencySelect: (currency: Currency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  displayCurrencies, 
  selectedCurrency, 
  onCurrencySelect 
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-full mb-6">
      {displayCurrencies.map((currency) => (
        <button
          key={currency}
          className={`
            uppercase font-bold rounded-md px-4 py-2
            ${selectedCurrency === currency 
              ? 'bg-bitcoin-orange hover:bg-bitcoin-orange/90 text-white' 
              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}
          `}
          onClick={() => onCurrencySelect(currency)}
        >
          {currency}
        </button>
      ))}
    </div>
  );
};

export default CurrencySelector;
