
import { CoinRates as CurrencyTypes } from '@/types/currency.types';

export type CoinRates = CurrencyTypes;

const saveRatesToCache = (rates: CoinRates) => {
  localStorage.setItem('bitcoinRates', JSON.stringify(rates));
  localStorage.setItem('ratesLastUpdated', Date.now().toString());
};

export const fetchCoinRates = async () => {
  console.log('Fetching fresh Bitcoin rates from API...');
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,chf,cny,jpy,gbp,aud,cad,inr,rub'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch rates from CoinGecko API');
    }
    
    const data = await response.json();
    
    const rates: CoinRates = {
      btc: 1,
      sats: 100000000, // 1 BTC = 100,000,000 satoshis
      usd: data.bitcoin.usd,
      eur: data.bitcoin.eur,
      chf: data.bitcoin.chf,
      cny: data.bitcoin.cny,
      jpy: data.bitcoin.jpy,
      gbp: data.bitcoin.gbp,
      aud: data.bitcoin.aud,
      cad: data.bitcoin.cad,
      inr: data.bitcoin.inr,
      rub: data.bitcoin.rub,
      lastUpdated: Date.now(),
    };
    
    saveRatesToCache(rates);
    
    return rates;
    
  } catch (error) {
    console.error('Error fetching rates:', error);
    throw error;
  }
};
