
import { useToast } from "@/components/ui/use-toast";
import { Currency } from "@/hooks/useSettings";

export interface CoinRates {
  btc: number;
  sats: number;
  usd: number;
  eur: number;
  chf: number;
  cny: number;
  jpy: number;
  gbp: number;
  aud: number;
  cad: number;
  inr: number;
  rub: number;
  lastUpdated: Date;
}

// Initial rates (in case API fails on first load)
const initialRates: CoinRates = {
  btc: 1,
  sats: 100000000, // 1 BTC = 100,000,000 satoshis
  usd: 68000,
  eur: 62500,
  chf: 60000,
  cny: 440000,
  jpy: 10000000,
  gbp: 53000,
  aud: 102000,
  cad: 91000,
  inr: 5600000,
  rub: 6200000,
  lastUpdated: new Date()
};

let cachedRates: CoinRates = { ...initialRates };
let lastFetchTime: number = 0;
const THROTTLE_TIME = 60000; // 1 minute in milliseconds

export async function fetchCoinRates(): Promise<CoinRates> {
  const currentTime = Date.now();
  
  // Check if we need to throttle the request
  if (currentTime - lastFetchTime < THROTTLE_TIME) {
    return cachedRates;
  }
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from CoinGecko');
    }
    
    const data = await response.json();
    
    if (!data.bitcoin) {
      throw new Error('Invalid response from CoinGecko API');
    }
    
    // Calculate rates
    const btcToUsd = data.bitcoin.usd;
    const btcToEur = data.bitcoin.eur;
    const btcToChf = data.bitcoin.chf;
    const btcToCny = data.bitcoin.cny;
    const btcToJpy = data.bitcoin.jpy;
    const btcToGbp = data.bitcoin.gbp;
    const btcToAud = data.bitcoin.aud;
    const btcToCad = data.bitcoin.cad;
    const btcToInr = data.bitcoin.inr;
    const btcToRub = data.bitcoin.rub;
    
    // Update cached rates
    cachedRates = {
      btc: 1,
      sats: 100000000, // 1 BTC = 100,000,000 satoshis
      usd: btcToUsd,
      eur: btcToEur,
      chf: btcToChf,
      cny: btcToCny,
      jpy: btcToJpy,
      gbp: btcToGbp,
      aud: btcToAud,
      cad: btcToCad,
      inr: btcToInr,
      rub: btcToRub,
      lastUpdated: new Date()
    };
    
    lastFetchTime = currentTime;
    return cachedRates;
  } catch (error) {
    console.error('Error fetching Bitcoin rates:', error);
    
    // If we have cached rates and this isn't the first fetch, return those
    if (lastFetchTime > 0) {
      return cachedRates;
    }
    
    // Otherwise return initial rates
    return initialRates;
  }
}

export function convertCurrency(amount: number, fromCurrency: Currency, rates: CoinRates): Record<string, number> {
  // Convert to BTC first
  let amountInBtc = 0;
  
  switch (fromCurrency) {
    case 'btc':
      amountInBtc = amount;
      break;
    case 'sats':
      amountInBtc = amount / rates.sats;
      break;
    case 'usd':
      amountInBtc = amount / rates.usd;
      break;
    case 'eur':
      amountInBtc = amount / rates.eur;
      break;
    case 'chf':
      amountInBtc = amount / rates.chf;
      break;
    case 'cny':
      amountInBtc = amount / rates.cny;
      break;
    case 'jpy':
      amountInBtc = amount / rates.jpy;
      break;
    case 'gbp':
      amountInBtc = amount / rates.gbp;
      break;
    case 'aud':
      amountInBtc = amount / rates.aud;
      break;
    case 'cad':
      amountInBtc = amount / rates.cad;
      break;
    case 'inr':
      amountInBtc = amount / rates.inr;
      break;
    case 'rub':
      amountInBtc = amount / rates.rub;
      break;
    default:
      amountInBtc = 0;
  }
  
  // Now convert from BTC to all other currencies
  return {
    btc: amountInBtc,
    sats: amountInBtc * rates.sats,
    usd: amountInBtc * rates.usd,
    eur: amountInBtc * rates.eur,
    chf: amountInBtc * rates.chf,
    cny: amountInBtc * rates.cny,
    jpy: amountInBtc * rates.jpy,
    gbp: amountInBtc * rates.gbp,
    aud: amountInBtc * rates.aud,
    cad: amountInBtc * rates.cad,
    inr: amountInBtc * rates.inr,
    rub: amountInBtc * rates.rub
  };
}

export function canRefreshRates(): boolean {
  return Date.now() - lastFetchTime >= THROTTLE_TIME;
}

export function formatCurrency(value: number, currency: string): string {
  if (currency === 'btc') {
    // Format BTC with up to 8 decimal places, trim trailing zeros
    return value.toLocaleString('en-US', { 
      maximumFractionDigits: 8,
      minimumFractionDigits: 0
    });
  } else if (currency === 'sats') {
    // Format satoshis as integers
    return Math.round(value).toLocaleString('en-US');
  } else {
    // Format fiat currencies with 2 decimal places
    return value.toLocaleString('en-US', { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'btc':
      return '₿';
    case 'sats':
      return 'sats';
    case 'usd':
      return '$';
    case 'eur':
      return '€';
    case 'chf':
      return 'CHF';
    case 'cny':
      return '¥';
    case 'jpy':
      return '¥';
    case 'gbp':
      return '£';
    case 'aud':
      return 'A$';
    case 'cad':
      return 'C$';
    case 'inr':
      return '₹';
    case 'rub':
      return '₽';
    default:
      return '';
  }
}

export function getLastUpdatedFormatted(timestamp: Date): string {
  // Format as YYYY-MM-DD HH:MM in UTC, without seconds
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, '0');
  const day = String(timestamp.getUTCDate()).padStart(2, '0');
  const hours = String(timestamp.getUTCHours()).padStart(2, '0');
  const minutes = String(timestamp.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}
