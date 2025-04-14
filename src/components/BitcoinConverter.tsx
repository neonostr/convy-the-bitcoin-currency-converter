
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, Coffee } from 'lucide-react';
import SettingsMenu from '@/components/SettingsMenu';
import DonationPopup from '@/components/DonationPopup';
import { useSettings, Currency } from '@/hooks/useSettings';
import { 
  fetchCoinRates, 
  CoinRates, 
  convertCurrency, 
  formatCurrency, 
  getCurrencySymbol, 
  getLastUpdatedFormatted,
  canRefreshRates 
} from '@/services/coingeckoService';

const BitcoinConverter = () => {
  const [amount, setAmount] = useState<string>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('btc');
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [canRefresh, setCanRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { settings } = useSettings();

  // Get the current display currencies (with live preview support)
  const displayCurrencies = settings.draftDisplayCurrencies || settings.displayCurrencies;

  useEffect(() => {
    if (isFirstLoad) {
      setAmount('1');
      setSelectedCurrency('btc');
      setIsFirstLoad(false);
    }
    
    fetchRates();
    
    const refreshCheckInterval = setInterval(() => {
      setCanRefresh(canRefreshRates());
    }, 5000);
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
          console.log('Service worker registration failed:', error);
        });
      });
    }
    
    return () => {
      clearInterval(refreshCheckInterval);
    };
  }, []);

  useEffect(() => {
    if (rates && amount !== '') {
      const normalizedAmount = amount.replace(',', '.');
      const numericAmount = parseFloat(normalizedAmount);
      
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency as Currency, rates);
        setConversions(newConversions);
      } else {
        setConversions({});
      }
    }
  }, [amount, selectedCurrency, rates]);

  useEffect(() => {
    let timer: number | null = null;
    
    if (refreshCountdown > 0) {
      timer = window.setInterval(() => {
        setRefreshCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [refreshCountdown]);

  useEffect(() => {
    if (canRefresh && rates !== null) {
      fetchRates();
    }
  }, [selectedCurrency]);

  const fetchRates = async () => {
    if (!canRefresh) return;
    
    setIsRefreshing(true);
    try {
      const newRates = await fetchCoinRates();
      setRates(newRates);
      setCanRefresh(false);
      setRefreshCountdown(60);
      
      if (!rates) {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
          const newConversions = convertCurrency(numericAmount, selectedCurrency as Currency, newRates);
          setConversions(newConversions);
        }
      }
      
      toast({
        title: "Currency Rates Updated",
        description: "I'll auto-refresh when you convert again - up to every 60 seconds.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      toast({
        title: "Oops! Rate update failed",
        description: "We couldn't update the rates. Please check your connection.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
      
      setTimeout(() => {
        setCanRefresh(canRefreshRates());
      }, 5000);
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setAmount('');
    
    if (rates) {
      const zeroConversions = convertCurrency(0, currency, rates);
      setConversions(zeroConversions);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const copyToClipboard = (value: string) => {
    const numericValue = value.replace(/[^\d.-]/g, '');
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

  const handleInputFocus = () => {
    setAmount('');
  };

  const handleInputChange = (value: string) => {
    if (/^-?\d*([.,]\d*)?$/.test(value)) {
      setAmount(value);
      
      if (canRefresh && value !== '') {
        fetchRates();
      }
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

      <div className="grid grid-cols-3 gap-2 w-full mb-6">
        {displayCurrencies.slice(0, 6).map((currency) => (
          <button
            key={currency}
            className={`
              uppercase font-bold rounded-md px-4 py-2
              ${selectedCurrency === currency 
                ? 'bg-bitcoin-orange hover:bg-bitcoin-orange/90 text-white' 
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}
            `}
            onClick={() => handleCurrencySelect(currency)}
          >
            {currency}
          </button>
        ))}
      </div>

      {rates && (
        <div className="text-sm text-muted-foreground mb-4">
          Last updated: {getLastUpdatedFormatted(rates.lastUpdated)}
        </div>
      )}

      <div className="w-full space-y-4 mb-4">
        {displayCurrencies
          .filter(currency => currency !== selectedCurrency)
          .slice(0, 5)
          .map((currency) => (
            <div
              key={currency}
              className="bg-secondary p-4 rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => copyToClipboard(`${formatCurrency(conversions[currency] || 0, currency)} ${getCurrencySymbol(currency)}`)}
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
      
      <div className="text-xs text-muted-foreground mb-4 text-center">
        Tap any result to copy. Data provided by CoinGecko API. All calculations are performed offline on your device. 
        You can <a href="https://github.com/neonostr/convy-the-bitcoin-currency-converter" className="text-muted-foreground" target="_blank" rel="noopener noreferrer">
          <u>check</u>
        </a> the source code to verify or host yourself. Add me to your home screen for a seamless web app experience.
      </div>

      <DonationPopup />
    </div>
  );
};

export default BitcoinConverter;
