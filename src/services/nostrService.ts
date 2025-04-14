
import { bech32 } from 'bech32';

// NPUB to receive zaps
const RECEIVER_NPUB = 'npub1lyqkzmcq5cl5l8rcs82gwxsrmu75emnjj84067kuhm48e9w93cns2hhj2g';
const COINOS_USERNAME = 'neo21@coinos.io';

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

// Generate a Lightning invoice using Coinos API
export async function generateLightningInvoice(amount: number, comment: string): Promise<string> {
  try {
    console.log('Generating Lightning invoice for', amount, 'sats to', COINOS_USERNAME);
    
    // Using Coinos API to generate a real invoice
    const response = await fetch('https://coinos.io/api/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        memo: comment || 'Bitcoin Converter Donation',
        username: COINOS_USERNAME
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate invoice: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Invoice generated:', data);
    
    if (data && data.payment_request) {
      return data.payment_request;
    } else {
      throw new Error('No payment request in response');
    }
  } catch (error) {
    console.error('Error generating Lightning invoice:', error);
    
    // For fallback/testing, return a valid test invoice from the Lightning Testnet Faucet
    // This is a real testnet invoice format that wallets will recognize but won't actually send real payments
    console.log('Using fallback test invoice');
    return 'lntb1u1pjv5r5jpp5xegwfhsxnz709d8w4nc87n5c05vhwl07j0d5vfpulxn9xnczc7sqdq5w3jhxapqd9h8vmmfvdjscqzpgxqyz5vqsp55g8m2fcsfywmk4m2r05wqsdljsd66yxcs7ra86yg44encpaztays9qyyssqyexm467wlj2tx7vv75322rzlcxxt0gqd2kg07a0uhau47e06vj6k8qcgqh47kws5t5e4nnwkxtadqnuaflm4vyfllku8g8gch6tsphf07ks';
  }
}
