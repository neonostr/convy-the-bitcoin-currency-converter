
# Plan: Hide "Add to Home Screen" Text When PWA is Installed

## Overview
Hide the "Add me to your home screen for a seamless web app experience." text from the converter footer when the app is already installed as a PWA. This is a minimal 2-line change.

## Implementation

### File: `src/components/BitcoinConverter.tsx`

**Change 1:** Add import for the `useInstallPrompt` hook (line 2)
```tsx
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
```

**Change 2:** Use the hook inside the component to get `isInstalled` status (around line 22)
```tsx
const { isInstalled } = useInstallPrompt();
```

**Change 3:** Modify the footer text rendering to strip out the "add to home screen" portion when installed (around line 177)
```tsx
let footerText = t('converter.ratesFooter');
if (isInstalled) {
  // Remove the "add to home screen" portion when already installed
  const addToHomeScreen = t('converter.addToHomeScreen');
  footerText = footerText.replace(addToHomeScreen, '').trim();
}
```

---

## Technical Details

- The `useInstallPrompt` hook detects PWA installation via:
  - `window.matchMedia('(display-mode: standalone)')` for most browsers
  - `navigator.standalone` for iOS Safari
- The `addToHomeScreen` translation key already exists in all languages, making the removal language-agnostic
- No translation file changes required - we simply filter out that sentence at render time

## Result
When the app runs as an installed PWA, the footer will show:
> "Tap any result to copy. Rates provided by Coingecko. All calculations are performed 100% offline on your device. You can check my source code to verify."

When running in browser (not installed), the full text including the install prompt will be shown.
