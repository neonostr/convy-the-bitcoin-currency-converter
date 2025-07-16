import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { Copy, ExternalLink } from 'lucide-react';

const ShareableUrlSettings: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  // Get current selected currency from localStorage
  const getCurrentCurrency = () => {
    return localStorage.getItem('selectedCurrency') || 'btc';
  };
  
  const generateCurrentUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('base', getCurrentCurrency());
    params.set('currencies', settings.displayCurrencies.join(','));
    return `${baseUrl}?${params.toString()}`;
  };
  
  const [shareableUrl, setShareableUrl] = useState(generateCurrentUrl());

  // Update URL when settings change
  React.useEffect(() => {
    const updateUrl = () => setShareableUrl(generateCurrentUrl());
    updateUrl();
    
    // Listen for custom currency change events
    const handleCurrencyChange = () => updateUrl();
    window.addEventListener('currencyChanged', handleCurrencyChange);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, [settings.displayCurrencies]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "URL Copied",
        description: "Shareable URL copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
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
      <h3 className="text-lg font-medium mb-4">Shareable URL</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Share your preferred currency configuration with others. The URL includes your selected base currency and display currencies in your preferred order.
      </p>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={shareableUrl}
            readOnly
            className="flex-1 text-xs"
            placeholder="Generating URL..."
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            title="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={openInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p className="mb-2"><strong>How to use:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Set up your preferred base currency and display currencies</li>
            <li>Arrange them in your desired order</li>
            <li>Copy the URL above to share your configuration</li>
            <li>Anyone opening this URL will see your exact setup</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareableUrlSettings;