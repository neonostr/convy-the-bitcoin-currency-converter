import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin } from 'lucide-react';
import SettingsMenu from '@/components/SettingsMenu';
import DonationPopup from '@/components/DonationPopup';
import { useSettings } from '@/hooks/useSettings';
import { useConversion } from '@/hooks/useConversion';
import CurrencySelector from '@/components/CurrencySelector';
import ConversionResults from '@/components/ConversionResults';
import { getLastUpdatedFormatted } from '@/utils/formatUtils';
import { Currency } from '@/types/currency.types';

const BitcoinConverter = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { 
    amount, 
    setAmount, 
    selectedCurrency, 
    rates, 
    conversions, 
    setConversions,
    handleCurrencySelect, 
    handleInputChange 
  } = useConversion();

  useEffect(() => {
    // We no longer log app usage from the frontend due to RLS restrictions
    // This will be handled by the edge function instead
  }, []);

  const { displayCurrencies } = settings;

  const handleInputFocus = () => {
    setAmount('');
    // Reset conversions to 0 when input field is focused
    if (rates) {
      const resetConversions: Record<string, number> = {};
      Object.keys(conversions).forEach(currency => {
        resetConversions[currency] = 0;
      });
      setConversions(resetConversions);
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Copied ${value}`,
        duration: 2000,
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const onCurrencySelect = (currency: Currency) => {
    handleCurrencySelect(currency);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-2">
          <Bitcoin className="text-bitcoin-orange h-8 w-8" />
          <h1 className="text-2xl font-bold">Bitcoin Currency Converter</h1>
        </div>
        <SettingsMenu />
      </div>

      <div className="w-full mb-6">
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="text-3xl md:text-4xl font-bold p-6 text-center w-full border border-bitcoin-orange focus:border-bitcoin-orange focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="Enter amount"
          value={amount}
          onFocus={handleInputFocus}
          onChange={(e) => handleInputChange(e.target.value)}
          autoFocus
        />
      </div>

      <CurrencySelector 
        displayCurrencies={displayCurrencies} 
        selectedCurrency={selectedCurrency} 
        onCurrencySelect={onCurrencySelect} 
      />

      {rates && (
        <div className="text-sm text-muted-foreground mb-4">
          Last updated: {getLastUpdatedFormatted(rates.lastUpdated)}
        </div>
      )}

      <ConversionResults 
        displayCurrencies={displayCurrencies}
        selectedCurrency={selectedCurrency}
        conversions={conversions}
        onResultClick={copyToClipboard}
      />
      
      <div className="text-xs text-muted-foreground mb-4 text-center">
        Tap any result to copy. Rates provided by CoinGecko API. All calculations are performed 100% offline on your device. You can check my <a href="https://github.com/neonostr/convy-the-bitcoin-currency-converter" className="text-muted-foreground" target="_blank" rel="noopener noreferrer">
          <u>source code</u>
        </a> to verify. Add me to your home screen for a seamless web app experience.
      </div>

      <DonationPopup />
    </div>
  );
};

export default BitcoinConverter;
