
# Replace Radix Toast with Sonner for Copy Confirmation

## Overview
Replace the current intrusive Radix toast notification with Sonner's minimal bottom toast for copy-to-clipboard confirmations. Sonner provides a more modern, less intrusive notification style that appears at the bottom of the screen and auto-dismisses quickly.

## Current State
- `BitcoinConverter.tsx` imports `useToast` from `@/hooks/use-toast` (Radix-based)
- The `copyToClipboard` function uses the Radix toast with title and description
- Both Radix `Toaster` and Sonner `Toaster` components are already included in `App.tsx`
- Sonner is fully configured in `src/components/ui/sonner.tsx` with theme support

## Implementation Steps

### Step 1: Update BitcoinConverter.tsx imports
**File: `src/components/BitcoinConverter.tsx`**

Replace the Radix toast import with Sonner's toast:

```tsx
// Before (line 5)
import { useToast } from '@/hooks/use-toast';

// After
import { toast } from 'sonner';
```

### Step 2: Remove useToast hook usage
**File: `src/components/BitcoinConverter.tsx`**

Remove the hook call since Sonner uses a direct function:

```tsx
// Before (line 21)
const { toast } = useToast();

// After
// Remove this line entirely - toast is imported directly
```

### Step 3: Update copyToClipboard function
**File: `src/components/BitcoinConverter.tsx`**

Simplify the toast call to use Sonner's minimal API:

```tsx
// Before (lines 103-114)
const copyToClipboard = (value: string) => {
  recordUserActivity();
  navigator.clipboard.writeText(value).then(() => {
    toast({
      title: "Copied to clipboard",
      description: `Copied ${value}`,
      duration: 2000,
    });
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};

// After
const copyToClipboard = (value: string) => {
  recordUserActivity();
  navigator.clipboard.writeText(value).then(() => {
    toast.success(`Copied ${value}`, {
      duration: 1500,
    });
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};
```

## Benefits
- **Less intrusive**: Sonner toasts are smaller and appear at the bottom of the screen
- **Faster dismiss**: Reduced duration from 2000ms to 1500ms for quicker feedback
- **Single line message**: Removed the separate title/description for a cleaner look
- **Modern appearance**: Sonner has a more polished, minimal design
- **Already configured**: Sonner is already set up with theme support in the project

## Files to Modify
1. `src/components/BitcoinConverter.tsx` - Update import and toast usage

## No Changes Needed
- `src/App.tsx` - Sonner `Toaster` component is already included
- `src/components/ui/sonner.tsx` - Already configured with theme support
