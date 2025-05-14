
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
    pln?: number;
    zar?: number;
  };
}

export interface RatesResponse {
  bitcoin: Record<string, number>;
}

export const supportedCurrencies = [
  'usd', 'eur', 'chf', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'inr', 'rub',
  'sek', 'nzd', 'krw', 'sgd', 'nok', 'mxn', 'brl', 'hkd', 'try', 'pln', 'zar'
];
