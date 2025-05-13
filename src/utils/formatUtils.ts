
import { Currency } from '@/types/currency.types';

export function formatCurrency(value: number, currency: string, decimalSeparator: string = '.'): string {
  const locale = 'en-US';
  let formatted: string;
  
  if (currency === 'btc') {
    formatted = value.toLocaleString(locale, { 
      maximumFractionDigits: 8,
      minimumFractionDigits: 0,
      useGrouping: true
    });
  } else if (currency === 'sats') {
    formatted = Math.round(value).toLocaleString(locale);
  } else {
    formatted = value.toLocaleString(locale, { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      useGrouping: true
    });
  }
  
  if (decimalSeparator === ',') {
    formatted = formatted.replace(/,/g, '___TEMP___');
    formatted = formatted.replace(/\./g, ',');
    formatted = formatted.replace(/___TEMP___/g, '.');
  }
  
  return formatted;
}

export function formatForCopy(
  value: number, 
  currency: string, 
  decimalSeparator: string = '.', 
  includeThouSep: boolean = false
): string {
  let formatted: string;
  
  if (currency === 'btc') {
    formatted = value.toFixed(8).replace(/\.?0+$/, '');
    if (formatted === '') formatted = '0';
  } else if (currency === 'sats') {
    formatted = Math.round(value).toString();
  } else {
    formatted = value.toFixed(2);
  }
  
  if (includeThouSep) {
    const parts = formatted.split('.');
    const thousandSeparator = decimalSeparator === ',' ? '.' : ',';
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    formatted = parts.join(decimalSeparator);
  } else {
    formatted = decimalSeparator === ',' ? formatted.replace('.', ',') : formatted;
  }
  
  return formatted;
}

export function getCurrencySymbol(currency: Currency): string {
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
      return 'Fr';
    case 'cny':
      return '¥';
    case 'jpy':
      return '¥';
    case 'gbp':
      return '£';
    case 'aud':
      return 'AU$';
    case 'cad':
      return 'CA$';
    case 'inr':
      return '₹';
    case 'rub':
      return '₽';
    case 'sek':
      return 'kr';
    case 'nzd':
      return 'NZ$';
    case 'krw':
      return '₩';
    case 'sgd':
      return 'SG$';
    case 'nok':
      return 'kr';
    case 'mxn':
      return '$';
    case 'brl':
      return 'R$';
    case 'hkd':
      return 'HK$';
    case 'try':
      return '₺';
    case 'pln':
      return 'zł';
    case 'zar':
      return 'R';
    default:
      return '';
  }
}

export function getLastUpdatedFormatted(timestamp: Date): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let tzLabel = '';
  if (tz) tzLabel = ` (${tz})`;

  return `${year}-${month}-${day} ${hours}:${minutes}${tzLabel}`;
}

export function getCurrencyLabel(currency: Currency): string {
  switch (currency) {
    case 'btc':
      return 'Bitcoin (BTC)';
    case 'sats':
      return 'Satoshis (SATS)';
    case 'usd':
      return 'US Dollar (USD)';
    case 'eur':
      return 'Euro (EUR)';
    case 'chf':
      return 'Swiss Franc (CHF)';
    case 'cny':
      return 'Chinese Yuan (CNY)';
    case 'jpy':
      return 'Japanese Yen (JPY)';
    case 'gbp':
      return 'British Pound (GBP)';
    case 'aud':
      return 'Australian Dollar (AUD)';
    case 'cad':
      return 'Canadian Dollar (CAD)';
    case 'inr':
      return 'Indian Rupee (INR)';
    case 'rub':
      return 'Russian Ruble (RUB)';
    case 'sek':
      return 'Swedish Krona (SEK)';
    case 'nzd':
      return 'New Zealand Dollar (NZD)';
    case 'krw':
      return 'South Korean Won (KRW)';
    case 'sgd':
      return 'Singapore Dollar (SGD)';
    case 'nok':
      return 'Norwegian Krone (NOK)';
    case 'mxn':
      return 'Mexican Peso (MXN)';
    case 'brl':
      return 'Brazilian Real (BRL)';
    case 'hkd':
      return 'Hong Kong Dollar (HKD)';
    case 'try':
      return 'Turkish Lira (TRY)';
    case 'pln':
      return 'Polish Zloty (PLN)';
    case 'zar':
      return 'South African Rand (ZAR)';
    default:
      return '';
  }
}
