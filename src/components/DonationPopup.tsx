
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee, Copy, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
  const [invoice, setInvoice] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate QR code from invoice
  useEffect(() => {
    if (invoice) {
      // Use a reliable QR code service
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(invoice)}&size=200x200&margin=10`;
      setQrData(qrCodeUrl);
    } else {
      setQrData('');
    }
  }, [invoice]);

  const fetchLightningAddress = async (): Promise<string | null> => {
    try {
      // In production, this would fetch the lightning address from a Nostr relay using the NPUB
      // For now, we're simulating this with a fixed LNURL
      console.log("Fetching lightning address for NPUB:", RECEIVER_NPUB);
      
      // Simulated LNURL for demo purposes
      const lnurlExample = "LNURL1DP68GURN8GHJ7MRWW4EXCTNRXUCMK8AMRJTMVWVSHHWCTVDANKJUEPWD9HKZ7TTWDEHHYMS9ACXZTMVDE6K2MNPDEJHSM3ZWF5Z7MPVDEJ42UMJV34K2VENX94NXVF5VUMN8QMRCVFJXZUJNWWSXVVNXWF5KG4RNWDR";
      return lnurlExample;
    } catch (error) {
      console.error('Error fetching lightning address:', error);
      return null;
    }
  };

  const generateInvoice = async (satAmount: number): Promise<string> => {
    try {
      // In production, this would call a Lightning Network service to generate a real invoice
      // For demo purposes, we generate a "realistic" fake invoice with the correct amount
      console.log("Generating invoice for", satAmount, "sats");
      
      // Create a more realistic invoice using the current timestamp and amount
      const timestamp = Math.floor(Date.now() / 1000);
      const randomDigits = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Format the amount with proper encoding
      const formattedAmount = satAmount.toString();
      
      // Create a fake but realistic-looking Lightning invoice
      const fakeInvoice = `lnbc${formattedAmount}n1p${randomDigits}pp5q0cm7dkwxecn4clrqvp5x7gj7nffmp69xqrszs05wfkjq5c9uslge2quw3jhucmvd9h8gztgcq${timestamp}sp5s8e244rvx0z0njqv9we9c2hcgw7p278h2mg4c5ta0ejq6r9gytj06qsqzcpgvvnlvv4ex7h657ftkfyxzdcnrl80qxsm3pxz4mg3ypjzgyt75smlvluewupkszgrhkh0hnhxk0sqq2qqqqqqqlgqqqqqeqqjqrz6rnf59rx867syp4lq2la73cxnlz5v7rnlctnzf8apmmuvxt9y5dczpgxdvj9sq9p2vzlq9q0l55exc32k6cwv6mkcjsqzc6dss`;
      
      return fakeInvoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice');
    }
  };

  const handleZap = async () => {
    setIsSending(true);
    setPaymentStatus('loading');
    
    try {
      // Step 1: Get lightning address
      const lnurlOrAddress = await fetchLightningAddress();
      
      if (!lnurlOrAddress) {
        throw new Error('Could not find Lightning address for this receiver');
      }
      
      // Step 2: Generate invoice based on the current amount
      const generatedInvoice = await generateInvoice(amount);
      setInvoice(generatedInvoice);
      
      // Transition to the invoice display state
      setTimeout(() => {
        setIsSending(false);
        setPaymentStatus('idle');
      }, 1500);
      
    } catch (error) {
      console.error('Error sending zap:', error);
      setPaymentStatus('error');
      setIsSending(false);
      toast({
        title: "Error generating payment",
        description: "We couldn't generate a Lightning invoice. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Simulate a successful payment
  const simulateSuccessfulPayment = () => {
    setPaymentStatus('success');
    toast({
      title: "Thank you!",
      description: "Your donation was received. Thank you for supporting this project!",
    });
    
    // Reset after 3 seconds
    setTimeout(() => {
      setInvoice('');
      setQrData('');
      setPaymentStatus('idle');
    }, 3000);
  };

  const copyInvoice = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice).then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Lightning invoice copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const setPresetAmount = (value: number) => {
    setAmount(value);
    // Clear any previous invoice when amount changes
    setInvoice('');
    setQrData('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className="flex items-center text-xs text-bitcoin-orange hover:text-bitcoin-orange/80 transition-colors cursor-pointer">
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
          {paymentStatus !== 'success' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (sats)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setPresetAmount(parseInt(e.target.value) || 0)}
                  min={1}
                  className="text-center text-lg font-bold"
                  disabled={!!invoice || isSending}
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
                      disabled={!!invoice || isSending}
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
                  disabled={!!invoice || isSending}
                />
              </div>
            </>
          )}
          
          {paymentStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-center">Thank You!</h3>
              <p className="text-center text-muted-foreground">
                Your donation helps keep this project going. Much appreciated!
              </p>
              <div className="animate-bounce text-4xl">🎉</div>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive font-medium">
                There was an error generating your payment. Please try again.
              </p>
            </div>
          ) : qrData ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-2 rounded-md">
                <img src={qrData} alt="Lightning QR Code" className="max-w-full h-auto" />
              </div>
              
              <div className="flex items-center w-full">
                <Input
                  value={invoice.substring(0, 15) + '...' + invoice.substring(invoice.length - 15)}
                  readOnly
                  className="pr-10 font-mono text-sm"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-8"
                  onClick={copyInvoice}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                Scan this QR code with your Lightning wallet to pay
              </p>
              
              {/* For demo purposes, we'll add a button to simulate a successful payment */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={simulateSuccessfulPayment}
                className="mt-4"
              >
                Simulate Successful Payment
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleZap} 
              className="w-full font-bold mt-2"
              disabled={isSending || amount <= 0}
            >
              {isSending ? "Generating invoice..." : `Zap ${amount.toLocaleString()} sats`}
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground mt-2">
            Powered by Nostr and Bitcoin Lightning. Pay the invoice with your Lightning wallet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationPopup;
