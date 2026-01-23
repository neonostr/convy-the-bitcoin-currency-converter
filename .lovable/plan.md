
# Proper PWA Update Fix: Add Manifest ID + Version Bump

## Why This Works (Not a Workaround)

The current manifest is missing an `id` property. Without it, Chrome uses the `start_url` as the unique app identifier. When we changed `start_url` from `/` to `/app`, Chrome may interpret this as a different application, breaking the update chain.

By adding a stable `id`, we ensure:
1. Chrome recognizes the app identity regardless of `start_url` changes
2. Manifest updates (including `start_url`) properly propagate to existing installations
3. Once updated, PWAs open directly at `/app` where the splash screen works naturally

## Implementation Steps

### Step 1: Add stable ID to manifest.json
**File: `public/manifest.json`**

Add an `id` property that uniquely identifies the app. This should never change:

```json
{
  "id": "convy-bitcoin-converter",
  "name": "Convy - Bitcoin Currency Converter",
  "short_name": "Convy",
  "start_url": "/app",
  ...
}
```

### Step 2: Update app version for verification
**File: `src/hooks/useSettings.tsx`**

Change version to `1.2.2` so users can verify the update worked:

```typescript
const APP_VERSION = '1.2.2';
```

### Step 3: Bump service worker cache version
**File: `public/service-worker.js`**

Force cache refresh:

```javascript
const CACHE_NAME = 'bitcoin-converter-cache-v8';
const APP_VERSION = '1.4.1';
```

---

## What Happens After Deployment

### On Chrome/Edge (Android/Desktop):
1. Browser detects manifest changes within ~24 hours
2. App ID ensures update applies to existing installation
3. `start_url` updates to `/app`
4. PWA now opens at `/app` directly
5. Splash screen works correctly

### The LandingPage redirect (already in place):
- Acts as a **bridge** during the 24-hour update window
- Once manifest updates propagate, this code path is never hit
- PWAs will open at `/app` directly, skipping LandingPage entirely

### On iOS/Safari:
- Unfortunately, iOS doesn't support manifest updates for installed PWAs
- Users would need to re-add the app
- The LandingPage redirect handles this case permanently

## Files to Modify
1. `public/manifest.json` - Add `id` property
2. `src/hooks/useSettings.tsx` - Update to version 1.2.2
3. `public/service-worker.js` - Bump cache version

## Testing
After a day or two:
1. Open existing PWA installation
2. Check settings - should show version 1.2.2
3. Splash screen should appear correctly
4. App should open directly at `/app` (check URL if possible)
