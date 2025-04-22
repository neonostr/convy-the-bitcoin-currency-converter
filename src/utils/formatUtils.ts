
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
  
  // If decimal separator is comma, we need to replace both the decimal point
  // and adjust the thousand separator to be a dot
  if (decimalSeparator === ',') {
    // First replace all commas temporarily to something else
    formatted = formatted.replace(/,/g, '___TEMP___');
    // Replace decimal points with commas
    formatted = formatted.replace(/\./g, ',');
    // Replace the temporary placeholders with dots (new thousand separator)
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
  
  // Apply thousand separators if needed
  if (includeThouSep) {
    // First split by the default dot decimal separator
    const parts = formatted.split('.');
    
    // Apply thousand separators using the appropriate separator based on decimal separator choice
    const thousandSeparator = decimalSeparator === ',' ? '.' : ',';
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    
    // Rejoin with the user's preferred decimal separator
    formatted = parts.join(decimalSeparator);
  } else {
    // If we're not including thousand separators, just replace the decimal separator
    formatted = decimalSeparator === ',' ? formatted.replace('.', ',') : formatted;
  }
  
  return formatted;
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
    case 'sek':
      return 'kr';
    case 'nzd':
      return 'NZ$';
    case 'krw':
      return '₩';
    case 'sgd':
      return 'S$';
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
    default:
      return '';
  }
}

export function getLastUpdatedFormatted(timestamp: Date): string {
  // Create a new Date object to avoid mutating the input
  const date = new Date(timestamp);
  
  // Get UTC components directly using UTC-specific methods
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

export function getCurrencyLabel(currency: string): string {
  switch (currency) {
    case 'btc': return 'Bitcoin (BTC)';
    case 'sats': return 'Satoshis (SATS)';
    case 'usd': return 'US Dollar (USD)';
    case 'eur': return 'Euro (EUR)';
    case 'chf': return 'Swiss Franc (CHF)';
    case 'cny': return 'Chinese Yuan (CNY)';
    case 'jpy': return 'Japanese Yen (JPY)';
    case 'gbp': return 'British Pound (GBP)';
    case 'aud': return 'Australian Dollar (AUD)';
    case 'cad': return 'Canadian Dollar (CAD)';
    case 'inr': return 'Indian Rupee (INR)';
    case 'rub': return 'Russian Ruble (RUB)';
    case 'sek': return 'Swedish Krona (SEK)';
    case 'nzd': return 'New Zealand Dollar (NZD)';
    case 'krw': return 'South Korean Won (KRW)';
    case 'sgd': return 'Singapore Dollar (SGD)';
    case 'nok': return 'Norwegian Krone (NOK)';
    case 'mxn': return 'Mexican Peso (MXN)';
    case 'brl': return 'Brazilian Real (BRL)';
    case 'hkd': return 'Hong Kong Dollar (HKD)';
    case 'try': return 'Turkish Lira (TRY)';
    default: return currency.toUpperCase();
  }
}
