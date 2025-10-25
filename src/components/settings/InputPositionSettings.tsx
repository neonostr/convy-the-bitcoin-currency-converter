import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';

const InputPositionSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium">{t('settings.inputPosition.title')}</h3>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t('settings.inputPosition.label')}</p>
          <p className="text-xs text-muted-foreground">
            {t('settings.inputPosition.description')}
          </p>
        </div>
        <Switch
          checked={settings.inputPosition === 'bottom'}
          onCheckedChange={(checked) => updateSettings({ inputPosition: checked ? 'bottom' : 'top' })}
        />
      </div>
    </div>
  );
};

export default InputPositionSettings;
