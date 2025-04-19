
import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';

const AppVersion = () => {
  const { appVersion } = useSettings();
  const { t } = useLanguage();
  
  return (
    <div className="pt-4 border-t text-center">
      <p className="text-xs text-muted-foreground">
        {t('settings.version')} {appVersion}
      </p>
    </div>
  );
};

export default AppVersion;
