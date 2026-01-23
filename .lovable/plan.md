
# Fix PWA Splash Screen Not Respecting User Theme Setting

## Problem Identified

The splash screen always appears in dark mode because there are **two different localStorage keys** being used for theme storage:

| Key | Used By | Purpose |
|-----|---------|---------|
| `'theme'` | index.html, main.tsx, useTheme.tsx | Splash screen + landing page |
| `'bitcoin-converter-settings'` | useSettings.tsx | App settings (contains theme inside object) |

When you toggle the theme in the app settings:
1. The theme is saved inside the settings object at `'bitcoin-converter-settings'`
2. The document class is updated (so the app looks correct)
3. **But `'theme'` localStorage key is never updated**

When the PWA opens:
1. The splash screen script reads from `localStorage.getItem('theme')`
2. This value is stale (or never set), so it falls back to system preference or stays dark
3. The splash screen appears in the wrong theme

## Solution

Update `useSettings.tsx` to also sync the theme to the standalone `'theme'` localStorage key whenever settings change. This ensures the splash screen initialization script reads the correct, current theme preference.

## Implementation

### File: `src/hooks/useSettings.tsx`

Update the useEffect that saves settings to also sync the theme to the standalone localStorage key:

```typescript
useEffect(() => {
  // Save settings to localStorage whenever they change - but defer this operation
  setTimeout(() => {
    try {
      localStorage.setItem('bitcoin-converter-settings', JSON.stringify(settings));
      // Also sync theme to standalone key for splash screen/initial load
      localStorage.setItem('theme', settings.theme);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, 100);
  
  // Update theme on document
  const { theme } = settings;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}, [settings]);
```

**Location**: Lines 68-84 in `src/hooks/useSettings.tsx`

## Why This Works

1. When user changes theme in settings, both localStorage keys get updated
2. Next time PWA opens, splash screen script reads correct theme from `'theme'` key
3. Splash screen immediately displays with correct light/dark colors
4. No changes needed to index.html or main.tsx - they already read from the right key

## Technical Details

### Files to modify
- `src/hooks/useSettings.tsx` - Add one line to sync theme to standalone key

### No changes needed
- `index.html` - Already correctly reads from `'theme'` key
- `main.tsx` - Already correctly reads from `'theme'` key
- `useTheme.tsx` - Used only for landing page, already syncs correctly

### Testing
1. Open the app and set theme to light mode in settings
2. Close the PWA completely
3. Reopen the PWA
4. Splash screen should now appear in light mode
