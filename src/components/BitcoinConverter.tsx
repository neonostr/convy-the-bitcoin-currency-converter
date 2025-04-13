
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Bitcoin, RefreshCw, Sun, Moon, Coffee } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { 
  fetchCoinRates, 
  CoinRates, 
  convertCurrency, 
  formatCurrency, 
  getCurrencySymbol, 
  getLastUpdatedFormatted,
  canRefreshRates 
} from '@/services/coingeckoService';

const CURRENCIES = ['btc', 'sats', 'usd', 'eur', 'chf', 'cny'];

const BitcoinConverter = () => {
  const [amount, setAmount] = useState<string>('1');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('btc');
  const [rates, setRates] = useState<CoinRates | null>(null);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [canRefresh, setCanRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
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
      // Normalize input - replace comma with period for calculation
      const normalizedAmount = amount.replace(',', '.');
      const numericAmount = parseFloat(normalizedAmount);
      
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, rates);
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

  const fetchRates = async () => {
    setIsRefreshing(true);
    try {
      const newRates = await fetchCoinRates();
      setRates(newRates);
      setCanRefresh(false);
      setRefreshCountdown(60);
      
      if (!rates) {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
          const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
          setConversions(newConversions);
        }
      }
      
      toast({
        title: "Rates updated",
        description: "Next refresh possible in 60 seconds",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      toast({
        title: "Failed to update rates",
        description: "Please try again later.",
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

  const handleCurrencySelect = (currency: string) => {
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

  const handleRefreshRates = () => {
    if (canRefresh) {
      fetchRates();
    } else {
      toast({
        title: "Rates updated",
        description: `Next refresh possible in ${refreshCountdown} seconds`,
        duration: 3000,
      });
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleInputFocus = () => {
    setAmount('');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-2">
          <Bitcoin className="text-bitcoin-orange h-8 w-8" />
          <h1 className="text-2xl font-bold">Bitcoin Currency Converter</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="w-full mb-6">
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="text-3xl md:text-4xl font-bold p-6 text-center w-full border border-bitcoin-orange focus:border-bitcoin-orange focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="Enter amount"
          value={amount}
          onFocus={handleInputFocus}
          onChange={(e) => {
            const value = e.target.value;
            if (/^-?\d*([.,]\d*)?$/.test(value)) {
              setAmount(value);
            }
          }}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-3 gap-2 w-full mb-6">
        {CURRENCIES.map((currency) => (
          <Button
            key={currency}
            variant={selectedCurrency === currency ? "default" : "outline"}
            className={`
              uppercase font-bold
              ${selectedCurrency === currency ? 'bg-bitcoin-orange hover:bg-bitcoin-orange/90' : ''}
            `}
            onClick={() => handleCurrencySelect(currency)}
          >
            {currency}
          </Button>
        ))}
      </div>

      {rates && (
        <div className="text-sm text-muted-foreground mb-4">
          Last updated: {getLastUpdatedFormatted(rates.lastUpdated)}
        </div>
      )}

      <div className="w-full space-y-4 mb-4">
        {CURRENCIES.filter(currency => currency !== selectedCurrency).map((currency) => (
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
      
      <div className="text-xs text-muted-foreground/50 mb-4 text-center">
        Tap any result to copy
      </div>

      <Button
        onClick={handleRefreshRates}
        disabled={isRefreshing || !canRefresh}
        className="w-full mb-4 bg-bitcoin-orange hover:bg-bitcoin-orange/90"
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Refreshing...
          </>
        ) : !canRefresh ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Rates ({refreshCountdown}s)
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Rates
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground/50 mb-4 text-center">
        Data provided by CoinGecko API. All calculations are performed offline on your device.
        <a href="https://github.com/neonostr/bitcoin-wise-converter-app" className="text-bitcoin-orange underline block mt-1" target="_blank" rel="noopener noreferrer">
          Download the source code to verify or host yourself
        </a>
      </div>

      <a href="https://zapmeacoffee.com/neo-nostrpurple-com" className="flex items-center text-xs text-muted-foreground/80 hover:text-bitcoin-orange transition-colors mb-2" target="_blank" rel="noopener noreferrer">
        <Coffee className="h-4 w-4 mr-1" />
        <span>Buy me a coffee</span>
      </a>
    </div>
  );
};

export default BitcoinConverter;
