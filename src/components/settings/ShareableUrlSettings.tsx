import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { Currency } from '@/types/currency.types';
import { Copy, ExternalLink } from 'lucide-react';

const ShareableUrlSettings: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  // State to track current selected currency for URL generation
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('selectedCurrency') || 'btc') as Currency;
  });
  
  // Generate shareable URL based on current state
  const generateCurrentShareableUrl = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('base', currentCurrency);
    params.set('currencies', settings.displayCurrencies.join(','));
    return `${baseUrl}?${params.toString()}`;
  }, [currentCurrency, settings.displayCurrencies]);
  
  const [shareableUrl, setShareableUrl] = useState(() => generateCurrentShareableUrl());

  // Listen for currency changes
  React.useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrentCurrency(event.detail);
    };
    
    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  // Update URL when currency or settings change
  React.useEffect(() => {
    setShareableUrl(generateCurrentShareableUrl());
  }, [generateCurrentShareableUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: t('settings.shareableUrl.copied'),
        description: t('settings.shareableUrl.copiedDescription'),
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast({
        title: t('settings.shareableUrl.copyFailed'),
        description: t('settings.shareableUrl.copyFailedDescription'),
        duration: 2000,
        variant: "destructive"
      });
    }
  };

  const openInNewTab = () => {
    window.open(shareableUrl, '_blank');
  };

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">{t('settings.shareableUrl.title')}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {t('settings.shareableUrl.description')}
      </p>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={shareableUrl}
            readOnly
            className="flex-1 text-xs"
            placeholder={t('settings.shareableUrl.placeholder')}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            title={t('settings.shareableUrl.copyTitle')}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={openInNewTab}
            title={t('settings.shareableUrl.openTitle')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          <p className="mb-2"><strong>{t('settings.shareableUrl.howToUse')}</strong></p>
          <ul className="list-disc list-outside space-y-1 pl-4">
            <li>{t('settings.shareableUrl.step1')}</li>
            <li>{t('settings.shareableUrl.step2')}</li>
            <li>{t('settings.shareableUrl.step3')}</li>
            <li>{t('settings.shareableUrl.step4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareableUrlSettings;