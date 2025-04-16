
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCoinosInvoice } from '@/services/coinosService';
import QRCode from 'qrcode';
import AmountSelector from './donation/AmountSelector';
import PaymentQR from './donation/PaymentQR';
import ThankYouMessage from './donation/ThankYouMessage';

const INITIAL_AMOUNT = 1000;

const DonationPopup: React.FC = () => {
  const [amount, setAmount] = useState<number>(INITIAL_AMOUNT);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Clean up any polling intervals when component unmounts
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const resetState = () => {
    setAmount(INITIAL_AMOUNT);
    setInvoice('');
    setQrData('');
    setIsSending(false);
    setPaymentConfirmed(false);
    setIsCopied(false);
    setIsEditing(false);
    
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset on close
      resetState();
    } else {
      // Force render with editing mode off when opening
      setIsEditing(false);
      
      // Small delay to ensure styles are properly applied
      requestAnimationFrame(() => {
        setIsOpen(open);
      });
    }
    setIsOpen(open);
  };

  const handleTriggerClick = () => {
    // Reset state completely when opening the popup
    resetState();
    setIsOpen(true);
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
      
      // Clear any existing interval before creating a new one
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      
      // Create a new polling interval
      const interval = setInterval(async () => {
        if (!verifyUrl) {
          clearInterval(interval);
          return;
        }
        
        await checkPaymentStatus(verifyUrl);
      }, 2000);
      
      setPollInterval(interval);

      // Set a timeout to clear the interval after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        setPollInterval(null);
      }, 300000);

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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={handleTriggerClick}>
        <a className="flex items-center text-xs text-bitcoin-orange hover:text-bitcoin-orange/80 transition-colors cursor-pointer">
          <Coffee className="h-4 w-4 mr-1" />
          <span>Zap me a coffee</span>
        </a>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-bitcoin-orange" />
            Zap me a coffee
          </DialogTitle>
          {!paymentConfirmed && (
            <DialogDescription>
              Support this project with some sats
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {paymentConfirmed ? (
            <ThankYouMessage />
          ) : !invoice ? (
            <>
              <AmountSelector
                amount={amount}
                onAmountChange={setAmount}
                disabled={isSending}
                isEditing={isEditing}
                onEditingChange={setIsEditing}
              />
              <Button 
                onClick={handleZap} 
                className="w-full font-bold mt-2"
                disabled={isSending || amount <= 0}
              >
                {isSending ? "Generating invoice..." : `Zap ${amount.toLocaleString()} sats`}
              </Button>
            </>
          ) : (
            <PaymentQR
              invoice={invoice}
              qrData={qrData}
              onCopy={() => setIsCopied(true)}
              isCopied={isCopied}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationPopup;
