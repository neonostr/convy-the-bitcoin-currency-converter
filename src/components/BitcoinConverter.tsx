
import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, LoaderCircle } from 'lucide-react';
import SettingsMenu from '@/components/SettingsMenu';
import DonationPopup from '@/components/DonationPopup';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { useConversion } from '@/hooks/useConversion';
import CurrencySelector from '@/components/CurrencySelector';
import ConversionResults from '@/components/ConversionResults';
import { getLastUpdatedFormatted } from '@/utils/formatUtils';
import { Currency } from '@/types/currency.types';
import { logAppOpen } from "@/services/eventLogger";

const BitcoinConverter = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { t, language } = useLanguage();
  const [initialLoad, setInitialLoad] = useState(true);
  const { 
    amount, 
    setAmount, 
    selectedCurrency, 
    rates, 
    isLoading,
    conversions, 
    setConversions,
    handleCurrencySelect, 
    handleInputChange,
    recordUserActivity,
    setDefaultBtcValue
  } = useConversion();

  useEffect(() => {
    const hasLoggedOpen = sessionStorage.getItem('app_open_logged');
    if (!hasLoggedOpen) {
      logAppOpen();
      sessionStorage.setItem('app_open_logged', 'true');
    }
    
    recordUserActivity();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordUserActivity();
        
        if (settings.alwaysDefaultToBtc && !document.activeElement?.matches('input')) {
          setDefaultBtcValue();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (settings.alwaysDefaultToBtc) {
      setDefaultBtcValue();
    }
    
    // Set a short timeout to determine if this is the initial load
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 5000); // Consider initial load phase to be over after 5 seconds
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timer);
    };
  }, [recordUserActivity, setDefaultBtcValue, settings.alwaysDefaultToBtc]);

  const { displayCurrencies } = settings;

  const handleInputFocus = () => {
    setAmount('');
    recordUserActivity();
    if (rates) {
      const resetConversions: Record<string, number> = {};
      Object.keys(conversions).forEach(currency => {
        resetConversions[currency] = 0;
      });
      setConversions(resetConversions);
    }
  };

  const copyToClipboard = (value: string) => {
    recordUserActivity();
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
          <h1 className="text-2xl font-bold">{t('converter.title')}</h1>
        </div>
        <SettingsMenu />
      </div>

      <div className="w-full mb-6">
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="text-3xl md:text-4xl font-bold p-6 text-center w-full border border-bitcoin-orange focus:border-bitcoin-orange focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder={t('converter.enterAmount')}
          value={amount}
          onFocus={handleInputFocus}
          onChange={(e) => handleInputChange(e.target.value)}
          autoFocus
        />
      </div>

      <CurrencySelector 
        displayCurrencies={settings.displayCurrencies} 
        selectedCurrency={selectedCurrency} 
        onCurrencySelect={onCurrencySelect} 
      />

      {isLoading && initialLoad ? (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>{t('converter.loadingRates')}</span>
        </div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground mb-4">
          {t('converter.gettingRates')}
        </div>
      ) : rates && (
        <div className="text-sm text-muted-foreground mb-4">
          {t('converter.lastUpdated')} {getLastUpdatedFormatted(rates.lastUpdated)}
        </div>
      )}

      <ConversionResults 
        displayCurrencies={settings.displayCurrencies}
        selectedCurrency={selectedCurrency}
        conversions={conversions}
        onResultClick={copyToClipboard}
      />
      
      <div className="text-xs text-muted-foreground mb-4 text-center">
        {
          (() => {
            const footerText = t('converter.ratesFooter');
            const anchorWord = t('converter.sourceCode');
            const parts = footerText.split(anchorWord);
            return parts.map((part, idx, arr) => (
              idx < arr.length - 1 ? (
                <React.Fragment key={idx}>
                  {part}
                  <a
                    href="https://github.com/neonostr/convy-the-bitcoin-currency-converter"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {anchorWord}
                  </a>
                </React.Fragment>
              ) : (
                part
              )
            ));
          })()
        }
      </div>

      <DonationPopup />
    </div>
  );
};

export default BitcoinConverter;
