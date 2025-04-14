
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee, Copy, Check, HeartHandshake } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createCoinosInvoice } from '@/services/coinosService';
import QRCode from 'qrcode';

const DonationPopup: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const { toast } = useToast();

  const resetState = () => {
    setInvoice('');
    setQrData('');
    setIsSending(false);
    setPaymentConfirmed(false);
  };

  const handleClose = () => {
    resetState();
  };

  const generateQR = async (invoice: string) => {
    try {
      const qrCodeData = await QRCode.toDataURL(invoice, {
        width: 250,
        margin: 1
      });
      setQrData(qrCodeData);
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  };

  const checkPaymentStatus = async (verifyUrl: string) => {
    try {
      const response = await fetch(verifyUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.settled) {
          setPaymentConfirmed(true);
          toast({
            title: "Thank you! 🙏",
            description: "Your support is greatly appreciated!",
          });
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleZap = async () => {
    setIsSending(true);
    
    try {
      const { invoice: generatedInvoice, verifyUrl } = await createCoinosInvoice(amount);
      setInvoice(generatedInvoice);
      await generateQR(generatedInvoice);
      
      // Start polling for payment confirmation
      const pollInterval = setInterval(async () => {
        if (!verifyUrl) {
          clearInterval(pollInterval);
          return;
        }
        
        await checkPaymentStatus(verifyUrl);
      }, 2000);

      // Clear polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);

    } catch (error) {
      console.error('Error generating lightning invoice:', error);
      toast({
        title: "Error generating payment",
        description: "We couldn't generate a Lightning invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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
    resetState();
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleClose()}>
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
            Support this project with some sats
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {paymentConfirmed ? (
            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
              <HeartHandshake className="h-16 w-16 text-bitcoin-orange animate-scale-in" />
              <h2 className="text-2xl font-bold text-center">Thank you for your support! ⚡️</h2>
            </div>
          ) : !invoice ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (sats)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setPresetAmount(Number(e.target.value))}
                  min={1}
                  className="text-center text-lg font-bold"
                  disabled={isSending}
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
                      disabled={isSending}
                    >
                      {value.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={handleZap} 
                className="w-full font-bold mt-2"
                disabled={isSending || amount <= 0}
              >
                {isSending ? "Generating invoice..." : `Zap ${amount.toLocaleString()} sats`}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-2 rounded-md">
                {qrData && <img src={qrData} alt="Lightning QR Code" className="max-w-full h-auto" />}
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationPopup;
