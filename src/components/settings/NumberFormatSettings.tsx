
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';

const NumberFormatSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();

  const getFormattedExample = () => {
    return settings.decimalSeparator === ',' ? '2.009,01' : '2,009.01';
  };

  const getCopyExample = () => {
    if (settings.includeThouSepWhenCopying) {
      return settings.decimalSeparator === ',' ? '2.009,01' : '2,009.01';
    } else {
      return settings.decimalSeparator === ',' ? '2009,01' : '2009.01';
    }
  };

  return (
    <div className="py-4 border-t">
      <h3 className="text-lg font-medium mb-4">{t('settings.numberFormat.title')}</h3>
      <div className="flex items-center justify-between space-x-2 mb-2">
        <Label htmlFor="decimal-separator">
          {t('settings.numberFormat.useCommaAsDecimalSeparator')}
        </Label>
        <Switch
          id="decimal-separator"
          checked={settings.decimalSeparator === ','}
          onCheckedChange={(checked) => 
            updateSettings({ decimalSeparator: checked ? ',' : '.' })
          }
        />
      </div>
      <div className="text-sm font-medium text-center mb-4 bg-secondary/50 p-2 rounded-md">
        {getFormattedExample()}
      </div>
      
      <div className="flex items-center justify-between space-x-2 mb-2">
        <Label htmlFor="thousand-separator-when-copying">
          {t('settings.numberFormat.includeThousandSeparatorsWhenCopying')}
        </Label>
        <Switch
          id="thousand-separator-when-copying"
          checked={settings.includeThouSepWhenCopying}
          onCheckedChange={(checked) => 
            updateSettings({ includeThouSepWhenCopying: checked })
          }
        />
      </div>
      <div className="text-sm font-medium text-center mb-4 bg-secondary/50 p-2 rounded-md">
        {getCopyExample()}
      </div>
    </div>
  );
};

export default NumberFormatSettings;
