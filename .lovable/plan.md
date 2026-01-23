
# Fix PWA Splash Screen Theme Issues

## Problem Identified
The splash screen always appears in dark mode regardless of the user's theme preference. This happens because:

1. **Hardcoded dark class**: The HTML element starts with `class="dark"` hardcoded
2. **Missing class removal**: The inline scripts that apply the theme use `classList.add()` without first removing the opposite class, resulting in the HTML having both `dark` and `light` classes
3. **CSS specificity**: When both classes exist, `.dark` styles override the base `:root` styles, making the splash screen always appear dark

## Solution
Fix the theme application at all early loading points to properly remove existing theme classes before adding the new one.

## Implementation Steps

### Step 1: Remove hardcoded dark class from HTML
**File: `index.html` (line 3)**

Remove the hardcoded `class="dark"` from the HTML element. The theme will be applied dynamically by the inline script before any content renders.

```html
<!-- Before -->
<html lang="en" class="dark">

<!-- After -->
<html lang="en">
```

### Step 2: Fix inline script to remove opposite class
**File: `index.html` (line 157)**

Update the inline script to first remove any existing theme classes before adding the correct one:

```javascript
// Before
document.documentElement.classList.add(theme);

// After
document.documentElement.classList.remove('light', 'dark');
document.documentElement.classList.add(theme);
```

### Step 3: Fix main.tsx theme application
**File: `src/main.tsx` (lines 7-16)**

Apply the same fix - remove existing classes before adding the new theme:

```typescript
// Before
if (savedTheme) {
  document.documentElement.classList.add(savedTheme);
} else {
  document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
}

// After
document.documentElement.classList.remove('light', 'dark');
if (savedTheme) {
  document.documentElement.classList.add(savedTheme);
} else {
  document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
}
```

---

## Technical Details

### Why this fixes the splash screen
- The splash screen uses CSS variables (`--background`, `--foreground`) that are defined differently in `:root` (light) vs `.dark` (dark mode)
- By ensuring only ONE theme class exists on the HTML element at any time, the correct CSS variables are applied
- The fix happens in the inline script which runs before any rendering, so the splash screen will immediately have the correct theme

### Files affected
1. `index.html` - Remove hardcoded class + fix inline script
2. `src/main.tsx` - Fix theme application logic

### No changes needed
- `src/hooks/useTheme.tsx` - Already correct (removes both classes before adding)
- `src/hooks/useSettings.tsx` - Already correct (removes both classes before adding)

### Testing
After implementation, the splash screen should:
- Appear in light mode when user has light theme preference
- Appear in dark mode when user has dark theme preference
- Respect the theme saved during PWA installation from the landing page
