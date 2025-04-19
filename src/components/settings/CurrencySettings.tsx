
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { useSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/hooks/useLanguage';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Currency } from '@/types/currency.types';
import { getCurrencyLabel } from '@/utils/formatUtils';

const MIN_CURRENCY_COUNT = 2;
const MAX_CURRENCY_COUNT = 6;

interface CurrencySettingsProps {
  isOpen: boolean;
}

const CurrencySettings = ({ isOpen }: CurrencySettingsProps) => {
  const { settings, updateDisplayCurrencies, allCurrencies } = useSettings();
  const { t } = useLanguage();
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCurrencies([...settings.displayCurrencies]);
    }
  }, [isOpen, settings.displayCurrencies]);

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

  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">{t('settings.displayCurrencies.title')}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {t('settings.displayCurrencies.description')}
      </p>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">{t('settings.displayCurrencies.selected')}</h4>
        <p className="text-xs text-muted-foreground mb-2">{t('settings.displayCurrencies.dragToReorder')}</p>
        
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
        <h4 className="text-sm font-medium">{t('settings.displayCurrencies.available')}</h4>
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
  );
};

export default CurrencySettings;
