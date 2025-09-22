import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';

const PersistentInputSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { t } = useLanguage();

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium">{t('settings.persistentInput.title')}</h3>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t('settings.persistentInput.label')}</p>
          <p className="text-xs text-muted-foreground">
            {t('settings.persistentInput.description')}
          </p>
        </div>
        <Switch
          checked={settings.persistentInputMode}
          onCheckedChange={(checked) => updateSettings({ persistentInputMode: checked })}
        />
      </div>
    </div>
  );
};

export default PersistentInputSettings;