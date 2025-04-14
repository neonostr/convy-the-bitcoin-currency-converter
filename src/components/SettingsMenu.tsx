
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun } from 'lucide-react';
import { useSettings, Currency } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const SettingsMenu: React.FC = () => {
  const { settings, toggleTheme, updateDisplayCurrencies, updateDraftCurrencies, cancelDraftChanges, allCurrencies } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);

  // Initialize selected currencies when the menu opens
  useEffect(() => {
    if (isOpen) {
      // Use draft currencies if available, otherwise use the current display currencies
      setSelectedCurrencies(
        settings.draftDisplayCurrencies || [...settings.displayCurrencies]
      );
    }
  }, [isOpen, settings.displayCurrencies, settings.draftDisplayCurrencies]);

  // Update the draft currencies whenever selected currencies change
  useEffect(() => {
    if (isOpen && selectedCurrencies.length > 0) {
      updateDraftCurrencies(selectedCurrencies);
    }
  }, [selectedCurrencies, isOpen, updateDraftCurrencies]);

  const handleDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) return;

    const items = Array.from(selectedCurrencies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedCurrencies(items);
  };

  const toggleCurrency = (currency: Currency) => {
    setSelectedCurrencies(prev => {
      if (prev.includes(currency)) {
        // Ensure we don't go below 6 currencies
        if (prev.length <= 6) {
          return prev;
        }
        return prev.filter(c => c !== currency);
      } else {
        return [...prev, currency];
      }
    });
  };

  const saveSettings = () => {
    updateDisplayCurrencies(selectedCurrencies);
    setIsOpen(false);
  };

  const handleCancel = () => {
    cancelDraftChanges();
    setIsOpen(false);
  };

  const getCurrencyLabel = (currency: Currency): string => {
    switch (currency) {
      case 'btc': return 'Bitcoin (BTC)';
      case 'sats': return 'Satoshis (sats)';
      case 'usd': return 'US Dollar (USD)';
      case 'eur': return 'Euro (EUR)';
      case 'chf': return 'Swiss Franc (CHF)';
      case 'cny': return 'Chinese Yuan (CNY)';
      case 'jpy': return 'Japanese Yen (JPY)';
      case 'gbp': return 'British Pound (GBP)';
      case 'aud': return 'Australian Dollar (AUD)';
      case 'cad': return 'Canadian Dollar (CAD)';
      case 'inr': return 'Indian Rupee (INR)';
      case 'rub': return 'Russian Ruble (RUB)';
      default: return currency;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your Bitcoin Converter experience
          </SheetDescription>
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
            Select at least 6 currencies to display on the main screen. Drag and drop to reorder.
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
                            <span className="font-medium">{getCurrencyLabel(currency)}</span>
                            <Switch 
                              checked={true}
                              onCheckedChange={() => toggleCurrency(currency)}
                              disabled={selectedCurrencies.length <= 6}
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
                    <span>{getCurrencyLabel(currency)}</span>
                    <Switch 
                      checked={false}
                      onCheckedChange={() => toggleCurrency(currency)}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
