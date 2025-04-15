
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

export interface RatesResponse {
  bitcoin: Record<string, number>;
}

export const supportedCurrencies = ['usd', 'eur', 'chf', 'cny', 'jpy', 'gbp', 'aud', 'cad', 'inr', 'rub'];
