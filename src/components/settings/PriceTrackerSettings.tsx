
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { useConversion } from '@/hooks/useConversion';

const PriceTrackerSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();
  const { setAmount, setDefaultBtcValue } = useConversion();

  const handlePriceTrackerToggle = (checked: boolean) => {
    updateSettings({ alwaysDefaultToBtc: checked });
    
    if (!checked) {
      setAmount('');
    }
  };

  return (
    <div className="py-4 border-t">
      <h3 className="text-lg font-medium mb-4">{t('settings.priceTracker.title')}</h3>
      <div className="flex items-center justify-between space-x-2 mb-2">
        <Label htmlFor="default-to-btc">
          {t('settings.priceTracker.btcPriceTrackerMode')}
        </Label>
        <Switch
          id="default-to-btc"
          checked={settings.alwaysDefaultToBtc}
          onCheckedChange={handlePriceTrackerToggle}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {t('settings.priceTracker.description')}
      </p>
    </div>
  );
};

export default PriceTrackerSettings;
