
interface LNURLData {
  callback: string;
  maxSendable: number;
  minSendable: number;
  status?: string;
  reason?: string;
}

interface InvoiceData {
  pr: string;
}

const COINOS_USERNAME = 'neo21';

export async function getLnurlData(): Promise<LNURLData> {
  const response = await fetch(`https://coinos.io/.well-known/lnurlp/${COINOS_USERNAME}`);
  
  if (!response.ok) {
    throw new Error(`Error retrieving LNURL data: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

export async function getInvoice(callbackUrl: string, amountMsat: number): Promise<InvoiceData> {
  const response = await fetch(`${callbackUrl}?amount=${amountMsat}`);
  
  if (!response.ok) {
    throw new Error(`Error generating invoice: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

export async function createCoinosInvoice(amountSats: number): Promise<string> {
  try {
    // Step 1: Get the LNURL-pay data
    const lnurlData = await getLnurlData();
    
    if (!lnurlData || lnurlData.status === 'ERROR') {
      throw new Error(lnurlData.reason || 'Invalid username or service unavailable');
    }
    
    // Step 2: Request a specific invoice (convert sats to millisats)
    const amountMsat = amountSats * 1000;
    
    if (amountMsat < lnurlData.minSendable || amountMsat > lnurlData.maxSendable) {
      throw new Error(`Amount must be between ${lnurlData.minSendable/1000} and ${lnurlData.maxSendable/1000} sats`);
    }
    
    const invoiceData = await getInvoice(lnurlData.callback, amountMsat);
    
    if (!invoiceData || !invoiceData.pr) {
      throw new Error('Failed to generate invoice');
    }
    
    return invoiceData.pr;
  } catch (error) {
    console.error('Error generating payment QR code:', error);
    throw error;
  }
}
