
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';

const ToastSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();
  
  const handleToastToggle = (checked: boolean) => {
    updateSettings({
      disableToasts: checked
    });
  };
  
  return (
    <div className="py-4 border-t">
      <h3 className="text-lg font-medium mb-4">{t('settings.notifications.title')}</h3>
      <div className="flex items-center justify-between space-x-2 mb-2">
        <Label htmlFor="disable-toasts">
          {t('settings.notifications.disableToasts')}
        </Label>
        <Switch 
          id="disable-toasts" 
          checked={settings.disableToasts} 
          onCheckedChange={handleToastToggle} 
        />
      </div>
      <p className="text-muted-foreground mb-4 text-sm">
        {t('settings.notifications.description')}
      </p>
    </div>
  );
};

export default ToastSettings;
