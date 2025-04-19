
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';

const AppearanceSettings = () => {
  const { settings, toggleTheme } = useSettings();
  const { t } = useLanguage();

  return (
    <div className="py-6">
      <h3 className="text-lg font-medium mb-4">{t('settings.appearance')}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="theme-toggle">{t('common.light')}</Label>
        </div>
        <Switch 
          id="theme-toggle"
          checked={settings.theme === 'dark'}
          onCheckedChange={toggleTheme}
        />
        <div className="flex items-center space-x-2">
          <Moon className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="theme-toggle">{t('common.dark')}</Label>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
