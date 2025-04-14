
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Currency } from '@/types/currency.types';
import { getCurrencyLabel } from '@/utils/formatUtils';

const FIXED_CURRENCY_COUNT = 6;

const SettingsMenu: React.FC = () => {
  const { settings, toggleTheme, updateDisplayCurrencies, allCurrencies } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);

  // Initialize selected currencies when the menu opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCurrencies([...settings.displayCurrencies]);
    }
  }, [isOpen, settings.displayCurrencies]);

  const handleDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) return;

    const items = Array.from(selectedCurrencies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update both local state and settings immediately
    setSelectedCurrencies(items);
    updateDisplayCurrencies(items);
  };

  const toggleCurrency = (currency: Currency, isEnabled: boolean) => {
    let newSelection: Currency[];
    
    if (isEnabled) {
      // Only add if we have less than FIXED_CURRENCY_COUNT
      if (selectedCurrencies.length < FIXED_CURRENCY_COUNT) {
        newSelection = [...selectedCurrencies, currency];
      } else {
        return; // Don't allow more than FIXED_CURRENCY_COUNT
      }
    } else {
      // Only remove if we still have FIXED_CURRENCY_COUNT currencies
      if (selectedCurrencies.length > FIXED_CURRENCY_COUNT) {
        newSelection = selectedCurrencies.filter(c => c !== currency);
      } else {
        return; // Don't allow less than FIXED_CURRENCY_COUNT
      }
    }
    
    // Update both local state and settings immediately
    setSelectedCurrencies(newSelection);
    updateDisplayCurrencies(newSelection);
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
            Select exactly {FIXED_CURRENCY_COUNT} currencies to display on the main screen. Drag and drop to reorder.
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
                              onCheckedChange={() => toggleCurrency(currency, false)}
                              disabled={selectedCurrencies.length <= FIXED_CURRENCY_COUNT}
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
                      onCheckedChange={() => toggleCurrency(currency, true)}
                      disabled={selectedCurrencies.length >= FIXED_CURRENCY_COUNT}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
