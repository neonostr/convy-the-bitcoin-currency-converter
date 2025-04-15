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
import { supabase } from "@/integrations/supabase/client";

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
    handleCurrencySelect, 
    handleInputChange 
  } = useConversion();

  useEffect(() => {
    // Determine if app is running as PWA or in browser
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true;
    
    // Log app usage when component mounts
    const logAppUsage = async () => {
      try {
        await supabase
          .from('usage_logs')
          .insert([
            { 
              event_type: isPwa ? 'app_open_pwa' : 'app_open_browser'
            }
          ]);
      } catch (error) {
        console.error('Failed to log app usage:', error);
      }
    };
    
    logAppUsage();
  }, []);

  const { displayCurrencies } = settings;

  const handleInputFocus = () => {
    setAmount('');
  };

  const copyToClipboard = (value: string) => {
    const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    navigator.clipboard.writeText(numericValue).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Copied ${numericValue}`,
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bitcoin className="text-bitcoin-orange h-8 w-8" />
          <h1 className="text-2xl font-bold">Bitcoin Currency Converter</h1>
        </div>
        <SettingsMenu />
      </div>

      <div className="mb-6">
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
