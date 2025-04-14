
import React from 'react';
import { Currency } from '@/types/currency.types';
import { formatCurrency, getCurrencySymbol } from '@/utils/formatUtils';

interface ConversionResultsProps {
  displayCurrencies: Currency[];
  selectedCurrency: Currency;
  conversions: Record<string, number>;
  onResultClick: (value: string) => void;
}

const ConversionResults: React.FC<ConversionResultsProps> = ({
  displayCurrencies,
  selectedCurrency,
  conversions,
  onResultClick
}) => {
  return (
    <div className="w-full space-y-4 mb-4">
      {displayCurrencies
        .filter(currency => currency !== selectedCurrency)
        .map((currency) => (
          <div
            key={currency}
            className="bg-secondary p-4 rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => onResultClick(`${formatCurrency(conversions[currency] || 0, currency)} ${getCurrencySymbol(currency)}`)}
          >
            <div className="flex justify-between">
              <span className="uppercase font-medium">{currency}</span>
              <span className="font-bold">
                {formatCurrency(conversions[currency] || 0, currency)} {getCurrencySymbol(currency)}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ConversionResults;
