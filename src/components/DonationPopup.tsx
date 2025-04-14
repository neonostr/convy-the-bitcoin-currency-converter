
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// NPUB to receive zaps
const RECEIVER_NPUB = 'npub1lyqkzmcq5cl5l8rcs82gwxsrmu75emnjj84067kuhm48e9w93cns2hhj2g';

interface ZapRequest {
  amount: number;
  comment: string;
  relays: string[];
  lnurl?: string;
}

const DonationPopup: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [comment, setComment] = useState<string>('Thanks for the Bitcoin Converter!');
  const [isSending, setIsSending] = useState<boolean>(false);
  const { toast } = useToast();

  // Convert npub to hex format
  const npubToHex = async (npub: string): Promise<string> => {
    try {
      // Use the nostr-tools library via CDN
      const script = document.createElement('script');
      script.src = 'https://bundle.run/nostr-tools@1.8.0';
      document.body.appendChild(script);
      
      // Wait for script to load
      await new Promise(resolve => script.onload = resolve);
      
      // @ts-ignore - nostr is loaded from the CDN
      const { nip19 } = window.nostrTools;
      const { data } = nip19.decode(npub);
      return data;
    } catch (error) {
      console.error('Error converting npub to hex:', error);
      return '';
    }
  };

  const getZapEndpoint = async (pubkeyHex: string): Promise<string | null> => {
    try {
      // Try to fetch from common relays
      const relays = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.snort.social'];
      
      // This is a simplified version - in a production app, we would use a proper nostr client
      for (const relay of relays) {
        try {
          const ws = new WebSocket(relay);
          
          const fetchPromise = new Promise<string | null>((resolve, reject) => {
            const timeout = setTimeout(() => {
              ws.close();
              resolve(null);
            }, 3000);
            
            ws.onopen = () => {
              const subscription = {
                "id": Math.random().toString(36).substring(7),
                "kinds": [0],
                "authors": [pubkeyHex],
                "limit": 1
              };
              
              ws.send(JSON.stringify(["REQ", subscription.id, subscription]));
            };
            
            ws.onmessage = (event) => {
              const data = JSON.parse(event.data);
              if (data[0] === "EVENT") {
                const userMetadata = JSON.parse(data[2].content);
                if (userMetadata.lud16 || userMetadata.lud06) {
                  clearTimeout(timeout);
                  ws.close();
                  
                  // Return the Lightning address or LNURL
                  const lightningAddress = userMetadata.lud16 || userMetadata.lud06;
                  resolve(lightningAddress);
                }
              }
            };
            
            ws.onerror = () => {
              clearTimeout(timeout);
              ws.close();
              resolve(null);
            };
          });
          
          const result = await fetchPromise;
          if (result) return result;
        } catch (error) {
          console.error(`Error fetching from relay ${relay}:`, error);
        }
      }
      
      // Fallback to a known static LNURL if available
      return "LNURL1DP68GURN8GHJ7MRWW4EXCTNRXUCMK8AMRJTMVWVSHHWCTVDANKJUEPWD9HKZ7TTWDEHHYMS9ACXZTMVDE6K2MNPDEJHSM3ZWF5Z7MPVDEJ42UMJV34K2VENX94NXVF5VUMN8QMRCVFJXZUJNWWSXVVNXWF5KG4RNWDR";
    } catch (error) {
      console.error('Error fetching zap endpoint:', error);
      return null;
    }
  };

  const handleZap = async () => {
    setIsSending(true);
    try {
      // Step 1: Convert npub to hex
      const pubkeyHex = await npubToHex(RECEIVER_NPUB);
      
      if (!pubkeyHex) {
        throw new Error('Failed to convert NPUB to hex format');
      }
      
      // Step 2: Get the Lightning address or LNURL
      const zapEndpoint = await getZapEndpoint(pubkeyHex);
      
      if (!zapEndpoint) {
        throw new Error('Could not find a Lightning address for this user');
      }
      
      // Step 3: Create a zap request
      const zapRequest: ZapRequest = {
        amount: amount,
        comment: comment,
        relays: ['wss://relay.damus.io', 'wss://nos.lol'],
      };
      
      // For Lightning address (email format)
      if (zapEndpoint.includes('@')) {
        const [name, domain] = zapEndpoint.split('@');
        const response = await fetch(`https://${domain}/.well-known/lnurlp/${name}`);
        const data = await response.json();
        zapRequest.lnurl = data.callback;
      } 
      // For LNURL
      else {
        zapRequest.lnurl = zapEndpoint;
      }
      
      // Step 4: Open in a new window (similar to Nostr Zap View)
      // In a production app, we would integrate WebLN or other payment methods
      // For now, open a Lightning wallet for payment
      if (zapRequest.lnurl) {
        window.open(`lightning:${zapRequest.lnurl}?amount=${amount}&comment=${encodeURIComponent(comment)}`, '_blank');
        
        toast({
          title: "Zap initiated",
          description: "Your Lightning wallet should open to complete the payment.",
          duration: 5000,
        });
      } else {
        throw new Error('Failed to generate payment request');
      }
    } catch (error) {
      console.error('Error sending zap:', error);
      toast({
        title: "Error sending zap",
        description: "Please try again later or use a different wallet.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const setPresetAmount = (value: number) => {
    setAmount(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className="flex items-center text-xs text-bitcoin-orange hover:text-bitcoin-orange/80 transition-colors">
          <Coffee className="h-4 w-4 mr-1" />
          <span>Zap me a coffee</span>
        </a>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-bitcoin-orange" />
            Zap a Coffee
          </DialogTitle>
          <DialogDescription>
            Support the developer with a Bitcoin Lightning payment
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (sats)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              min={100}
              className="text-center text-lg font-bold"
            />
            
            <div className="flex gap-2 mt-2">
              {[1000, 5000, 10000, 21000].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={amount === value ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPresetAmount(value)}
                >
                  {value.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
            />
          </div>
          
          <Button 
            onClick={handleZap} 
            className="w-full font-bold mt-2"
            disabled={isSending || amount < 100}
          >
            {isSending ? "Processing..." : `Zap ${amount.toLocaleString()} sats`}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-2">
            Powered by Nostr and Bitcoin Lightning. Payment will open in your Lightning wallet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationPopup;
