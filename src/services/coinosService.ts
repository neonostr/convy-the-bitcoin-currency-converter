
interface LNURLData {
  callback: string;
  maxSendable: number;
  minSendable: number;
  status?: string;
  reason?: string;
}

interface InvoiceData {
  pr: string;
  verify?: string;
}

// CHANGED DONATION RECEIVER HERE:
// Access image via: [your app's base URL]/lovable-uploads/3ea16b8d-4ec7-4ac2-8195-8c5575377664.png
const COINOS_USERNAME = 'convyclick';

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

export async function createCoinosInvoice(amountSats: number): Promise<{ invoice: string; verifyUrl?: string }> {
  try {
    const lnurlData = await getLnurlData();
    
    if (!lnurlData || lnurlData.status === 'ERROR') {
      throw new Error(lnurlData.reason || 'Invalid username or service unavailable');
    }
    
    const amountMsat = amountSats * 1000;
    
    if (amountMsat < lnurlData.minSendable || amountMsat > lnurlData.maxSendable) {
      throw new Error(`Amount must be between ${lnurlData.minSendable/1000} and ${lnurlData.maxSendable/1000} sats`);
    }
    
    const invoiceData = await getInvoice(lnurlData.callback, amountMsat);
    
    if (!invoiceData || !invoiceData.pr) {
      throw new Error('Failed to generate invoice');
    }
    
    return {
      invoice: invoiceData.pr,
      verifyUrl: invoiceData.verify
    };
  } catch (error) {
    console.error('Error generating payment QR code:', error);
    throw error;
  }
}
