
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Support Convy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            No ads. No tracking. Just sats.
          </p>

          {qrData && (
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-xl">
                <img 
                  src={qrData} 
                  alt="Lightning Address QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>Lightning Address</span>
            </div>
            
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <code className="flex-1 text-sm text-foreground break-all">
                {LIGHTNING_ADDRESS}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Thank you for valuing my work.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingDonationPopup;
