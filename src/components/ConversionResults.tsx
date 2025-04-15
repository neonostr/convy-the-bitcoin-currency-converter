
import React from 'react';
import { Currency } from '@/types/currency.types';
import { formatCurrency, getCurrencySymbol } from '@/utils/formatUtils';
import { useSettings } from '@/hooks/useSettings';

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
  const { settings } = useSettings();

  const formatForCopy = (value: number) => {
    // Format as raw number with the correct decimal separator
    const formatted = value.toString();
    return settings.decimalSeparator === ',' ? formatted.replace('.', ',') : formatted;
  };

  return (
    <div className="w-full space-y-4 mb-4">
      {displayCurrencies
        .filter(currency => currency !== selectedCurrency)
        .map((currency) => {
          const value = conversions[currency] || 0;
          return (
            <div
              key={currency}
              className="bg-secondary p-4 rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => onResultClick(formatForCopy(value))}
            >
              <div className="flex justify-between">
                <span className="uppercase font-medium">
                  {currency === 'sats' ? 'SATS' : currency}
                </span>
                <span className="font-bold">
                  {formatCurrency(value, currency)} {getCurrencySymbol(currency)}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ConversionResults;
