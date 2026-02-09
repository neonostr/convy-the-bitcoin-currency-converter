import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent
        className="left-[50%] translate-x-[-50%] w-[calc(100%-2rem)] max-w-xs overflow-hidden"
        style={{ padding: 0, gap: 0 }}
      >
        <div className="flex flex-col items-center" style={{ padding: '17px 20px 28px' }}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>

          <div style={{ height: 8 }} />

          <DialogTitle className="text-center text-base">Thank you for caring</DialogTitle>

          <div style={{ height: 12 }} />

          {qrData && (
            <a
              href={`lightning:${LIGHTNING_ADDRESS}`}
              className="bg-white p-2 rounded-lg block cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src={qrData}
                alt="Lightning Address QR Code"
                className="w-36 h-36 sm:w-40 sm:h-40"
              />
            </a>
          )}

          <div style={{ height: 12 }} />

          <div className="w-full space-y-1.5">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingDonationPopup;
