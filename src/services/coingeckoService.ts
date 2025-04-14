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

// Current market rates as fallback (April 2023)
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
    // Using the correct CoinGecko API endpoint to get real-time rates
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data from CoinGecko: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.bitcoin) {
      throw new Error('Invalid response from CoinGecko API');
    }
    
    console.log("Bitcoin rates from API:", data.bitcoin);
    
    // Update cached rates with real rates from the API
    cachedRates = {
      btc: 1,
      sats: 100000000, // 1 BTC = 100,000,000 satoshis
      usd: data.bitcoin.usd || initialRates.usd,
      eur: data.bitcoin.eur || initialRates.eur,
      chf: data.bitcoin.chf || initialRates.chf,
      cny: data.bitcoin.cny || initialRates.cny,
      jpy: data.bitcoin.jpy || initialRates.jpy,
      gbp: data.bitcoin.gbp || initialRates.gbp,
      aud: data.bitcoin.aud || initialRates.aud,
      cad: data.bitcoin.cad || initialRates.cad,
      inr: data.bitcoin.inr || initialRates.inr,
      rub: data.bitcoin.rub || initialRates.rub,
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
    default:
      // For all other currencies, divide by their BTC rate
      if (rates[fromCurrency] && rates[fromCurrency] > 0) {
        amountInBtc = amount / rates[fromCurrency];
      }
      break;
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
