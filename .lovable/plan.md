
# Fix PWA UI Vertical Centering

## Problem

The UI elements appear stuck to the top of the screen in PWA mode instead of being properly centered. This happens because:

1. PWA mode applies `position: fixed` to `#root`
2. The `Index.tsx` wrapper also uses `fixed inset-0`
3. Nested fixed positioning causes the flex centering to fail

## Solution

Adjust the CSS and layout so that centering happens at the `#root` level in PWA mode, avoiding the nested fixed positioning conflict.

## Changes

### 1. Update PWA styles in `src/index.css`

Make `#root` a flex container that centers content in PWA mode:

```css
html.pwa-mode #root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2. Simplify `src/pages/Index.tsx`

Remove the `fixed inset-0` from the wrapper since the centering will now be handled by `#root` in PWA mode. The component should work for both PWA and browser modes:

```tsx
const Index = () => {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-background overflow-hidden touch-manipulation">
      <BitcoinConverter />
    </div>
  );
};
```

This uses `min-h-[100dvh]` which:
- Works in regular browser mode (landing page flow)
- Fills the viewport correctly in PWA mode where `#root` is fixed

## Technical Details

| File | Change |
|------|--------|
| `src/index.css` | Add `display: flex`, `align-items: center`, `justify-content: center` to `.pwa-mode #root` |
| `src/pages/Index.tsx` | Change from `fixed inset-0` to `min-h-[100dvh] w-full` for better compatibility |

## Why This Works

- In **PWA mode**: `#root` is fixed full-screen and acts as the centering container. The `Index` div fills it and centers its child.
- In **browser mode**: `#root` is normal flow, the `Index` div uses `min-h-[100dvh]` to fill the viewport and center content.

This eliminates the nested `position: fixed` conflict that was preventing proper vertical centering.
