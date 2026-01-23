
# Scale Down Desktop App Layout for Better Proportions

## Problem Summary

On desktop/laptop screens, the app converter UI appears too large and fills too much of the viewport, leaving little to no spacing at the top and bottom. The mobile and PWA versions should remain unchanged.

## Visual Comparison

- **Current**: Content fills entire viewport height, elements appear oversized
- **Desired**: Content is proportionally smaller, creating visible breathing room above and below

## Solution Approach

Apply a CSS scaling transformation on larger screens only. This approach:
- Keeps mobile/PWA appearance exactly the same
- Uses a CSS media query to target only desktop-sized screens (768px and above)
- Scales down the entire converter component proportionally
- Avoids changing individual component sizes (which could break mobile)

## Technical Implementation

### File: `src/pages/Index.tsx`

Add a desktop-only wrapper that applies `transform: scale()` to reduce the overall size on larger screens:

```tsx
const Index = () => {
  return (
    <div className="flex h-[100dvh] items-center justify-center p-4 bg-background overflow-hidden">
      <div className="md:scale-90 md:origin-center">
        <BitcoinConverter />
      </div>
    </div>
  );
};
```

This scales the entire converter to 90% on medium and larger screens (768px+), creating the desired spacing effect.

### Alternative: Use max-height constraint

If scaling causes any visual issues, an alternative is to add a `max-height` constraint with padding on desktop:

```tsx
const Index = () => {
  return (
    <div className="flex h-[100dvh] items-center justify-center p-4 md:py-12 bg-background overflow-hidden">
      <BitcoinConverter />
    </div>
  );
};
```

This adds vertical padding only on desktop screens.

## Recommended Approach

Use the **scale transformation** approach because:
1. It uniformly shrinks all elements (fonts, buttons, inputs) proportionally
2. Matches the look in the "desired" screenshot where everything appears smaller
3. Single change with no risk of breaking individual component layouts
4. The `md:` prefix ensures mobile/PWA stays exactly the same

## Files to Modify

1. `src/pages/Index.tsx` - Add desktop-only scaling wrapper

## What Stays the Same

- Mobile layout (under 768px width)
- PWA appearance on mobile devices
- All component internals (`BitcoinConverter.tsx`, `CurrencySelector.tsx`, `ConversionResults.tsx`)
- All existing styles and spacings

## Testing

1. View app on desktop browser - should appear smaller with more breathing room
2. View app on mobile or narrow viewport - should look exactly the same as before
3. Test PWA on mobile - no changes expected
