
import { bech32 } from 'bech32';

// NPUB to receive zaps
const RECEIVER_NPUB = 'npub1lyqkzmcq5cl5l8rcs82gwxsrmu75emnjj84067kuhm48e9w93cns2hhj2g';

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

// Generate a Lightning invoice for a zap
export async function generateLightningInvoice(amount: number, comment: string): Promise<string> {
  try {
    const receiverHex = npubToHex(RECEIVER_NPUB);
    console.log('Generating Lightning invoice for', amount, 'sats to', receiverHex);

    // For demonstration purposes, we're generating a realistic invoice structure
    // In production, you would connect to a real Lightning service
    
    // Create a deterministic invoice based on the amount and timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const prefix = 'lnbc';
    const formattedAmount = amount.toString();
    const randomPart = Math.random().toString(36).substring(2, 8);
    
    // Structure a realistic looking invoice
    const invoice = `${prefix}${formattedAmount}n1p${randomPart}sp5zyg3rp0yctwsnu90e8q9q5pos9qc${timestamp}f28jlsmj0vsxpmmvf40up5h7grhwdcxyw3hx2a8heq6mpl5p0ltgwl6jlsgz9ekx7enxv4jxgegvypkxzmnwyp3xzmnxd3kxsmk09h8ggr0defh8ycqzpgxqyd9uqsp5usxj4xsuz9rt7773anxnurxnz0lvsq95ezmkxwh37tscye47wts9qyyssq66zt344hgs94rfn4f422tsuu7z80rnmx5yw8a0lyd4hfygrq0c2lae47d54gnkru4usap4u267paf8d9gs6kz77x3kvcdjfwrj5uuqpkh3c0c`;
    
    return invoice;
  } catch (error) {
    console.error('Error generating Lightning invoice:', error);
    throw new Error('Failed to generate Lightning invoice');
  }
}
