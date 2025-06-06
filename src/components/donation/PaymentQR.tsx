
import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';

interface PaymentQRProps {
  invoice: string;
  qrData: string;
  onCopy: () => void;
  isCopied: boolean;
}

const PaymentQR = ({ invoice, qrData, onCopy, isCopied }: PaymentQRProps) => {
  const { t } = useLanguage();
  
  const handleCopy = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice).then(() => {
        onCopy();
      });
    }
  };

  return (
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
          onClick={handleCopy}
        >
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <p className="text-sm text-center text-muted-foreground">
        {t('donation.scanQR')}
      </p>
    </div>
  );
};

export default PaymentQR;
