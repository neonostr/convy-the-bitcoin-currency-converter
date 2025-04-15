
export type Currency = 'btc' | 'sats' | 'usd' | 'eur' | 'chf' | 'cny' | 'jpy' | 'gbp' | 'aud' | 'cad' | 'inr' | 'rub';

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
  lastUpdated: Date | number;
}

export interface CoinGeckoResponse {
  bitcoin: {
    usd?: number;
    eur?: number;
    chf?: number;
    cny?: number;
    jpy?: number;
    gbp?: number;
    aud?: number;
    cad?: number;
    inr?: number;
    rub?: number;
  };
}
