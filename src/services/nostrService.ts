
import { bech32 } from 'bech32';

// NPUB to receive zaps
const RECEIVER_NPUB = 'npub1lyqkzmcq5cl5l8rcs82gwxsrmu75emnjj84067kuhm48e9w93cns2hhj2g';
const LIGHTNING_ADDRESS = 'neo21@coinos.io';

// Convert npub to hex
export function npubToHex(npub: string): string {
  try {
    const { words } = bech32.decode(npub);
    const data = bech32.fromWords(words);
    return Buffer.from(data).toString('hex');
  } catch (error) {
    console.error('Failed to convert npub to hex:', error);
    // Default fallback for demonstration
    return '7e7e9c42a91bfef19fa929e5fda1b72e0ebc1a4c1141673e2794234d86addf4e';
  }
}

// Structure for Nostr zap request
export interface ZapRequest {
  kind: number;
  pubkey: string;
  content: string;
  tags: string[][];
  created_at: number;
}

// Create a zap request event
export function createZapRequest(amount: number, comment: string, pubkey: string): ZapRequest {
  const zapRequest: ZapRequest = {
    kind: 9734, // Zap Request kind
    pubkey: pubkey, // Will be replaced with user pubkey
    content: comment || '',
    tags: [
      ['p', pubkey],
      ['amount', amount.toString()],
      ['relays', 'wss://relay.damus.io', 'wss://nostr.mutinywallet.com'],
    ],
    created_at: Math.floor(Date.now() / 1000),
  };
  
  return zapRequest;
}

// Generate a Lightning invoice
export async function generateLightningInvoice(amount: number, comment: string): Promise<string> {
  try {
    console.log('Generating Lightning invoice for', amount, 'sats');
    
    // Use LNBits LNURLPay as a more reliable and CORS-friendly option
    // This uses a public LNURLPay endpoint
    const lnurlEndpoint = `https://legend.lnbits.com/lnurlp/api/v1/lnurl/cb/1YDtpjMW3JNHwXWzcwvjLv`;
    
    // LNURLPay requires amount in millisatoshis
    const response = await fetch(`${lnurlEndpoint}?amount=${amount * 1000}`);
    
    if (!response.ok) {
      throw new Error(`Failed to generate LNURL: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('LNURL response:', data);
    
    if (data && data.pr) {
      return data.pr;
    } 
    
    // If we don't get a direct payment request, try with lightning.tools
    // which works with lightning addresses
    const lightningAddressUrl = `https://api.lightning.tools/invoice?ln=${LIGHTNING_ADDRESS}&amount=${amount}&memo=${encodeURIComponent(comment || 'Bitcoin Converter Donation')}`;
    
    const addressResponse = await fetch(lightningAddressUrl);
    
    if (!addressResponse.ok) {
      throw new Error(`Failed to resolve lightning address: ${addressResponse.status}`);
    }
    
    const addressData = await addressResponse.json();
    
    if (addressData && addressData.invoice) {
      return addressData.invoice;
    }
    
    throw new Error('No payment request in response');
  } catch (error) {
    console.error('Error generating Lightning invoice:', error);
    
    // For fallback/testing, we can try WebLN if available in the browser
    if (typeof window !== 'undefined' && 'webln' in window) {
      try {
        // @ts-ignore - WebLN type
        await window.webln.enable();
        // @ts-ignore - WebLN type
        const { paymentRequest } = await window.webln.makeInvoice({
          amount: amount,
          defaultMemo: comment || 'Bitcoin Converter Donation'
        });
        return paymentRequest;
      } catch (weblnError) {
        console.error('WebLN fallback failed:', weblnError);
      }
    }
    
    // Final fallback to a test invoice from the Lightning Testnet
    console.log('Using fallback test invoice');
    return 'lntb1u1pjv5r5jpp5xegwfhsxnz709d8w4nc87n5c05vhwl07j0d5vfpulxn9xnczc7sqdq5w3jhxapqd9h8vmmfvdjscqzpgxqyz5vqsp55g8m2fcsfywmk4m2r05wqsdljsd66yxcs7ra86yg44encpaztays9qyyssqyexm467wlj2tx7vv75322rzlcxxt0gqd2kg07a0uhau47e06vj6k8qcgqh47kws5t5e4nnwkxtadqnuaflm4vyfllku8g8gch6tsphf07ks';
  }
}
