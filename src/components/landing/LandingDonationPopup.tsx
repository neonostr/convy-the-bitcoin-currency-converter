
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Zap, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface LandingDonationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LIGHTNING_ADDRESS = 'convy@coinos.io';

const LandingDonationPopup: React.FC<LandingDonationPopupProps> = ({ open, onOpenChange }) => {
  const [qrData, setQrData] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (open) {
      generateQR();
    }
  }, [open]);

  const generateQR = async () => {
    try {
      const qrCodeData = await QRCode.toDataURL(`lightning:${LIGHTNING_ADDRESS}`, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrData(qrCodeData);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LIGHTNING_ADDRESS);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-2 max-w-[calc(100%-1rem)] sm:max-w-xs p-4">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-base">Support Convy</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-center text-xs text-muted-foreground">
            No ads. No tracking. Just sats.
          </p>

          {qrData && (
            <div className="flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                <img 
                  src={qrData} 
                  alt="Lightning Address QR Code" 
                  className="w-36 h-36 sm:w-40 sm:h-40"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-primary" />
              <span>Lightning Address</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 bg-muted rounded-md px-3 py-2">
              <code className="text-xs text-foreground font-mono">
                {LIGHTNING_ADDRESS}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Thank you for valuing my work.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingDonationPopup;
