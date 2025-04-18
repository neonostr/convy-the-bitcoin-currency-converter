
import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Currency } from '@/types/currency.types';
import { getCurrencyLabel } from '@/utils/formatUtils';
import { useConversion } from '@/hooks/useConversion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';

// Define currency count limits
const MIN_CURRENCY_COUNT = 2;
const MAX_CURRENCY_COUNT = 10;

const SettingsMenu: React.FC = () => {
  const { settings, toggleTheme, updateDisplayCurrencies, allCurrencies, updateSettings, appVersion } = useSettings();
  const { setAmount, handleCurrencySelect } = useConversion();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCurrencies([...settings.displayCurrencies]);
    }
  }, [isOpen, settings.displayCurrencies]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && selectedCurrencies.length >= MIN_CURRENCY_COUNT) {
      updateDisplayCurrencies(selectedCurrencies);
    }
    setIsOpen(open);
  }, [selectedCurrencies, updateDisplayCurrencies]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedCurrencies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedCurrencies(items);
    updateDisplayCurrencies(items);
  };

  const toggleCurrency = (currency: Currency, isEnabled: boolean) => {
    let newSelection: Currency[];
    
    if (isEnabled) {
      if (selectedCurrencies.length < MAX_CURRENCY_COUNT) {
        newSelection = [...selectedCurrencies, currency];
      } else {
        return;
      }
    } else {
      if (selectedCurrencies.length > MIN_CURRENCY_COUNT) {
        newSelection = selectedCurrencies.filter(c => c !== currency);
      } else {
        return;
      }
    }
    
    setSelectedCurrencies(newSelection);
    updateDisplayCurrencies(newSelection);
  };

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

  const handlePriceTrackerToggle = (checked: boolean) => {
    updateSettings({ alwaysDefaultToBtc: checked });
    
    if (!checked) {
      setAmount('');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('settings')}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <h3 className="text-lg font-medium mb-4">{t('appearance', 'settings')}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="theme-toggle">{t('light', 'settings')}</Label>
            </div>
            <Switch 
              id="theme-toggle"
              checked={settings.theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="theme-toggle">{t('dark', 'settings')}</Label>
            </div>
          </div>
        </div>
        
        <div className="py-4 border-t">
          <h3 className="text-lg font-medium mb-4">{t('language', 'settings')}</h3>
          <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'es' | 'de')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('chooseLanguage', 'settings')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="py-4">
          <h3 className="text-lg font-medium mb-4">{t('displayCurrencies', 'settings')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('selectCurrencies', 'settings').replace('{min}', MIN_CURRENCY_COUNT.toString()).replace('{max}', MAX_CURRENCY_COUNT.toString())}
          </p>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">{t('selectedCurrencies', 'settings')}</h4>
            <p className="text-xs text-muted-foreground mb-2">{t('dragToReorder', 'settings')}</p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="selected-currencies">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {selectedCurrencies.map((currency, index) => (
                      <Draggable key={currency} draggableId={currency} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 bg-secondary rounded-md"
                          >
                            <span className="font-medium">
                              {currency === 'sats' ? 'Satoshis (SATS)' : getCurrencyLabel(currency)}
                            </span>
                            <Switch 
                              checked={true}
                              onCheckedChange={() => toggleCurrency(currency, false)}
                              disabled={selectedCurrencies.length <= MIN_CURRENCY_COUNT}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium">{t('availableCurrencies', 'settings')}</h4>
            <div className="space-y-2">
              {allCurrencies
                .filter(currency => !selectedCurrencies.includes(currency))
                .map(currency => (
                  <div
                    key={currency}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                  >
                    <span>
                      {currency === 'sats' ? 'Satoshis (SATS)' : getCurrencyLabel(currency)}
                    </span>
                    <Switch 
                      checked={false}
                      onCheckedChange={() => toggleCurrency(currency, true)}
                      disabled={selectedCurrencies.length >= MAX_CURRENCY_COUNT}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="py-4 border-t">
          <h3 className="text-lg font-medium mb-4">{t('numberFormat', 'settings')}</h3>
          <div className="flex items-center justify-between space-x-2 mb-2">
            <Label htmlFor="decimal-separator">
              {t('useCommaDecimal', 'settings')}
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
              {t('includeThousandSep', 'settings')}
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

        <div className="py-4 border-t">
          <h3 className="text-lg font-medium mb-4">{t('priceTracker', 'settings')}</h3>
          <div className="flex items-center justify-between space-x-2 mb-2">
            <Label htmlFor="default-to-btc">
              {t('priceTrackerMode', 'settings')}
            </Label>
            <Switch
              id="default-to-btc"
              checked={settings.alwaysDefaultToBtc}
              onCheckedChange={handlePriceTrackerToggle}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {t('priceTrackerDesc', 'settings')}
          </p>
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Version {appVersion}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
