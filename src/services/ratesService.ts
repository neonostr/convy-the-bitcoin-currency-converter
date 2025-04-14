
import { CoinRates, Currency } from "@/types/currency.types";

// Current market rates as fallback (Updated April 2023)
export const initialRates: CoinRates = {
  btc: 1,
  sats: 100000000, // 1 BTC = 100,000,000 satoshis
  usd: 70123,
  eur: 64852,
  chf: 62754,
  cny: 510430,
  jpy: 10854000,
  gbp: 55621,
  aud: 105823,
  cad: 95241,
  inr: 5853000,
  rub: 6423000,
  lastUpdated: new Date()
};

let cachedRates: CoinRates = { ...initialRates };
let lastFetchTime: number = 0;
export const THROTTLE_TIME = 60000; // 1 minute in milliseconds

export function getCachedRates(): CoinRates {
  return { ...cachedRates };
}

export function updateCachedRates(rates: CoinRates): void {
  cachedRates = { ...rates };
  lastFetchTime = Date.now();
}

export function canRefreshRates(): boolean {
  return Date.now() - lastFetchTime >= THROTTLE_TIME;
}

export function getLastFetchTime(): number {
  return lastFetchTime;
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
