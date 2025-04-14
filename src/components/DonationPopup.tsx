
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee, Copy, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Lightning address to receive payments
const LIGHTNING_ADDRESS = 'neo21@coinos.io';

const DonationPopup: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [comment, setComment] = useState<string>('Thanks for the Bitcoin Converter!');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Short delay to avoid flicker during closing animation
      setTimeout(() => {
        setInvoice('');
        setQrData('');
        setPaymentStatus('idle');
      }, 300);
    }
  }, [isOpen]);

  // Generate QR code from invoice
  useEffect(() => {
    if (invoice) {
      // Make sure the QR code includes the lightning: prefix for wallet apps
      const invoiceData = invoice.startsWith('lightning:') ? invoice : `lightning:${invoice}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(invoiceData)}&size=200x200&margin=10`;
      setQrData(qrCodeUrl);
    } else {
      setQrData('');
    }
  }, [invoice]);

  const handleZap = async () => {
    setIsSending(true);
    setPaymentStatus('loading');
    
    try {
      // Use lightning.tools which specializes in working with lightning addresses
      const lightningAddressUrl = `https://api.lightning.tools/invoice?ln=${LIGHTNING_ADDRESS}&amount=${amount}&memo=${encodeURIComponent(comment || 'Bitcoin Converter Donation')}`;
      
      const response = await fetch(lightningAddressUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to get invoice: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.invoice) {
        setInvoice(data.invoice);
        setIsSending(false);
        setPaymentStatus('idle');
      } else {
        // Direct fallback to LNURL.com service if first one fails
        const lnurlResponse = await fetch(`https://lnurl.com/api/v1/links/invoice?address=${LIGHTNING_ADDRESS}&amount=${amount * 1000}`);
        
        if (!lnurlResponse.ok) {
          throw new Error('Failed to get invoice from fallback service');
        }
        
        const lnurlData = await lnurlResponse.json();
        
        if (lnurlData && lnurlData.payment_request) {
          setInvoice(lnurlData.payment_request);
          setIsSending(false);
          setPaymentStatus('idle');
        } else {
          throw new Error('No payment request in response');
        }
      }
    } catch (error) {
      console.error('Error generating lightning invoice:', error);
      
      // Try WebLN as last resort if available
      if (typeof window !== 'undefined' && 'webln' in window) {
        try {
          // @ts-ignore - WebLN type
          await window.webln.enable();
          // @ts-ignore - WebLN type
          const { paymentRequest } = await window.webln.makeInvoice({
            amount: amount,
            defaultMemo: comment || 'Bitcoin Converter Donation'
          });
          setInvoice(paymentRequest);
          setIsSending(false);
          setPaymentStatus('idle');
          return;
        } catch (weblnError) {
          console.error('WebLN fallback failed:', weblnError);
        }
      }
      
      // Final fallback to a direct coinos.io LNURL
      try {
        // This is a URL format that should work with coinos.io addresses
        const coinosUrl = `https://coinos.io/api/lightning/invoice?address=${encodeURIComponent(LIGHTNING_ADDRESS)}&amount=${amount * 1000}&memo=${encodeURIComponent(comment || 'Bitcoin Converter Donation')}`;
        
        const coinosResponse = await fetch(coinosUrl);
        
        if (!coinosResponse.ok) {
          throw new Error('Failed with coinos fallback');
        }
        
        const coinosData = await coinosResponse.json();
        
        if (coinosData && coinosData.payment_request) {
          setInvoice(coinosData.payment_request);
          setIsSending(false);
          setPaymentStatus('idle');
          return;
        }
      } catch (coinosError) {
        console.error('Coinos fallback failed:', coinosError);
      }
      
      setPaymentStatus('error');
      setIsSending(false);
      toast({
        title: "Error generating payment",
        description: "We couldn't generate a Lightning invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // For demo purposes, we can simulate a successful payment
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

  const handleAmountChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setPresetAmount(numValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            Zap me a coffee
          </DialogTitle>
          <DialogDescription>
            Support me with some Sats.
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
                  onChange={(e) => handleAmountChange(e.target.value)}
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
                  value={invoice.length > 30 ? `${invoice.substring(0, 15)}...${invoice.substring(invoice.length - 15)}` : invoice}
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
              
              {/* For demo purposes only */}
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
            Powered by Bitcoin Lightning. Pay the invoice with your Lightning wallet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationPopup;
