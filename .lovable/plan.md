
# Prevent PWA Scroll Bounce for Native App Experience

## Overview

Add scroll-prevention styles that only apply when the app is running as an installed PWA (using the `.pwa-mode` class). Regular browser users on the landing page will be completely unaffected.

## Changes

### 1. Add PWA-specific styles to `src/index.css`

Add new CSS rules after the existing `@layer base` block (after line 89):

```css
/* PWA-specific styles - prevent scroll bounce for native app feel */
/* These ONLY apply when .pwa-mode class is present (installed PWAs only) */
html.pwa-mode,
html.pwa-mode body {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  touch-action: none;
}

html.pwa-mode #root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
```

### 2. Update viewport meta tag in `index.html`

Update the viewport meta tag to include scaling prevention and keyboard handling:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
```

### 3. Add touch-manipulation to `src/pages/Index.tsx`

Update the main container class to re-enable internal touch gestures:

```tsx
<div className="flex h-[100dvh] items-center justify-center p-4 bg-background overflow-hidden touch-manipulation">
```

## Why This Is Safe for Landing Page

- The `.pwa-mode` class is ONLY added when `isPWA()` returns true (standalone mode detection)
- Browser users visiting the landing page will NOT have this class
- All scroll-prevention CSS is scoped to `html.pwa-mode` selector
- Landing page scrolling remains completely normal

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add PWA scroll-prevention styles |
| `index.html` | Update viewport meta tag |
| `src/pages/Index.tsx` | Add `touch-manipulation` class |
