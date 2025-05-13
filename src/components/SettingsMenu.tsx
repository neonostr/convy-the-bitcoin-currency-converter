
import React, { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import LanguageSelector from '@/components/settings/LanguageSelector';
import CurrencySettings from '@/components/settings/CurrencySettings';
import NumberFormatSettings from '@/components/settings/NumberFormatSettings';
import PriceTrackerSettings from '@/components/settings/PriceTrackerSettings';
import ToastSettings from '@/components/settings/ToastSettings';
import AboutSection from '@/components/settings/AboutSection';
import AppVersion from '@/components/settings/AppVersion';

const SettingsMenu: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('settings.title')}</SheetTitle>
        </SheetHeader>
        <AppearanceSettings />
        <LanguageSelector />
        <CurrencySettings isOpen={isOpen} />
        <NumberFormatSettings />
        <PriceTrackerSettings />
        <ToastSettings />
        <AboutSection />
        <AppVersion />
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
