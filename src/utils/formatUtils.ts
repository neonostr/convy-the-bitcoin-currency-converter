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

export function getLastUpdatedFormatted(timestamp: Date | number): string {
  // Convert to Date object if timestamp is a number
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  // Format as YYYY-MM-DD HH:MM in UTC, without seconds
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
    default: return currency;
  }
}
