
export type Currency = 'btc' | 'sats' | 'usd' | 'eur' | 'chf' | 'cny' | 'jpy' | 'gbp' | 'aud' | 'cad' | 'inr' | 'rub' | 
                      'sek' | 'nzd' | 'krw' | 'sgd' | 'nok' | 'mxn' | 'brl' | 'hkd' | 'try';

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
  sek: number;
  nzd: number;
  krw: number;
  sgd: number;
  nok: number;
  mxn: number;
  brl: number;
  hkd: number;
  try: number;
  lastUpdated: Date;
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
    sek?: number;
    nzd?: number;
    krw?: number;
    sgd?: number;
    nok?: number;
    mxn?: number;
    brl?: number;
    hkd?: number;
    try?: number;
  };
}
