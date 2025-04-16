
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AmountSelectorProps {
  amount: number;
  onAmountChange: (value: number) => void;
  disabled: boolean;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

const AmountSelector = ({ 
  amount, 
  onAmountChange, 
  disabled,
  isEditing,
  onEditingChange 
}: AmountSelectorProps) => {
  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onEditingChange(true);
    e.target.select();
  };

  const handleClick = () => {
    onEditingChange(true);
  };

  const presetAmounts = [1000, 5000, 10000, 21000];

  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Amount (sats)</Label>
      <div 
        className="relative" 
        onClick={handleClick}
      >
        {isEditing ? (
          <Input
            id="amount"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            onFocus={handleAmountFocus}
            min={1}
            className="text-center text-lg font-bold"
            disabled={disabled}
            autoFocus
          />
        ) : (
          <div 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg font-bold cursor-pointer"
            onClick={handleClick}
          >
            {amount}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-2">
        {presetAmounts.map((value) => (
          <Button
            key={value}
            type="button"
            variant={amount === value ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              onAmountChange(value);
              onEditingChange(false);
            }}
            disabled={disabled}
          >
            {value.toLocaleString()}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AmountSelector;
