
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
  
  if (includeThouSep) {
    const parts = formatted.split('.');
    // Use the appropriate thousand separator based on decimal separator choice
    const thousandSeparator = decimalSeparator === ',' ? '.' : ',';
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    formatted = parts.join(decimalSeparator);
  } else {
    // Only replace the decimal separator without adding thousand separators
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
    default:
      return '';
  }
}

export function getLastUpdatedFormatted(timestamp: Date): string {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, '0');
  const day = String(timestamp.getUTCDate()).padStart(2, '0');
  const hours = String(timestamp.getUTCHours()).padStart(2, '0');
  const minutes = String(timestamp.getUTCMinutes()).padStart(2, '0');
  
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
    default: return currency;
  }
}
