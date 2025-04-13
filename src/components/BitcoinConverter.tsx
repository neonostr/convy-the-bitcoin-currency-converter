
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Bitcoin, RefreshCw } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch rates on component mount
  useEffect(() => {
    fetchRates();
    
    // Set refresh availability check interval
    const refreshCheckInterval = setInterval(() => {
      setCanRefresh(canRefreshRates());
    }, 5000); // Check every 5 seconds
    
    // Register manifest for web app capability
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

  // Update conversions when amount, selected currency or rates change
  useEffect(() => {
    if (rates && amount !== '') {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        const newConversions = convertCurrency(numericAmount, selectedCurrency, rates);
        setConversions(newConversions);
      } else {
        setConversions({});
      }
    }
  }, [amount, selectedCurrency, rates]);

  const fetchRates = async () => {
    setIsRefreshing(true);
    try {
      const newRates = await fetchCoinRates();
      setRates(newRates);
      setCanRefresh(false);
      
      // If this is our first fetch, update conversions immediately
      if (!rates) {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount)) {
          const newConversions = convertCurrency(numericAmount, selectedCurrency, newRates);
          setConversions(newConversions);
        }
      }
      
      toast({
        title: "Rates updated",
        description: "Bitcoin exchange rates have been refreshed.",
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
      
      // Schedule the next check for refresh availability
      setTimeout(() => {
        setCanRefresh(canRefreshRates());
      }, 5000);
    }
  };

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency);
    setAmount('');
    
    // Focus the input field and show numeric keyboard on mobile
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRefreshRates = () => {
    if (canRefresh) {
      fetchRates();
    } else {
      toast({
        title: "Rate limit",
        description: "Please wait at least 1 minute between refreshes.",
        duration: 3000,
      });
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Value ${value} copied to clipboard.`,
        duration: 2000,
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="flex items-center space-x-2 mb-6">
        <Bitcoin className="text-bitcoin-orange h-8 w-8" />
        <h1 className="text-2xl font-bold">Bitcoin Currency Converter</h1>
      </div>

      <div className="w-full mb-6">
        <Input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          className="text-xl p-6 text-center w-full border-2 border-bitcoin-orange"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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

      <div className="w-full space-y-4 mb-6">
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

      <Button
        onClick={handleRefreshRates}
        disabled={isRefreshing || !canRefresh}
        className="w-full mb-6 bg-bitcoin-orange hover:bg-bitcoin-orange/90"
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Refreshing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Rates
          </>
        )}
      </Button>

      <div className="text-sm text-center text-muted-foreground mb-2">
        Data provided by CoinGecko API. All calculations are performed offline on your device.
      </div>
      <div className="text-sm text-center">
        <a href="https://github.com/yourusername/bitcoin-converter" className="text-bitcoin-orange underline">
          Download the source code to verify or host yourself
        </a>
      </div>
    </div>
  );
};

export default BitcoinConverter;
