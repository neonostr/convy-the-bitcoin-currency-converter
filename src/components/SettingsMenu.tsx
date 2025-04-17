
import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Currency } from '@/types/currency.types';
import { getCurrencyLabel } from '@/utils/formatUtils';

const MIN_CURRENCY_COUNT = 2;
const MAX_CURRENCY_COUNT = 6;

const SettingsMenu: React.FC = () => {
  const { settings, toggleTheme, updateDisplayCurrencies, allCurrencies, updateSettings, appVersion } = useSettings();
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

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <h3 className="text-lg font-medium mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="theme-toggle">Light</Label>
            </div>
            <Switch 
              id="theme-toggle"
              checked={settings.theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="theme-toggle">Dark</Label>
            </div>
          </div>
        </div>
        
        <div className="py-4">
          <h3 className="text-lg font-medium mb-4">Display Currencies</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select between {MIN_CURRENCY_COUNT} and {MAX_CURRENCY_COUNT} currencies to display on the main screen. Drag and drop to reorder.
          </p>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Selected Currencies</h4>
            <p className="text-xs text-muted-foreground mb-2">Drag to reorder:</p>
            
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
            <h4 className="text-sm font-medium">Available Currencies</h4>
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
          <h3 className="text-lg font-medium mb-4">Number Format</h3>
          <div className="flex items-center justify-between space-x-2 mb-2">
            <Label htmlFor="decimal-separator">
              Use comma as decimal separator
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
              Include thousand separators when copying
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
          <h3 className="text-lg font-medium mb-4">Default Behavior</h3>
          <div className="flex items-center justify-between space-x-2 mb-2">
            <Label htmlFor="default-to-btc">
              Always show 1 BTC on app open/resume
            </Label>
            <Switch
              id="default-to-btc"
              checked={settings.alwaysDefaultToBtc}
              onCheckedChange={(checked) => 
                updateSettings({ alwaysDefaultToBtc: checked })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            When enabled, the app will default to showing the value of 1 BTC whenever you open or resume it.
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
