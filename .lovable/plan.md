
# Fix Existing PWA Installations Landing on Landing Page

## Problem Analysis

Existing PWA installations are landing on the landing page (`/`) instead of `/app` because:

1. **Cached content**: The service worker has cached `/` (the old app location) and may serve it from cache
2. **No redirect logic**: There's no mechanism to detect a PWA user at `/` and redirect them to `/app`
3. **Manifest scope limitation**: The scope `/app` means the service worker cannot control navigation at `/`

## Solution

Implement PWA detection in the LandingPage component that automatically redirects PWA users to `/app`. This is the cleanest solution because:
- It works for existing installations
- It works even with cached pages
- It doesn't require service worker changes
- It happens at the application level

## Implementation Steps

### Step 1: Add PWA detection and redirect to LandingPage
**File: `src/pages/LandingPage.tsx`**

Add a `useEffect` hook that checks if the app is running as an installed PWA, and if so, immediately redirects to `/app`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Inside the component:
const navigate = useNavigate();

useEffect(() => {
  // Check if running in standalone/PWA mode
  const isPWA = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
  
  if (isPWA) {
    // Redirect PWA users to /app immediately
    navigate('/app', { replace: true });
  }
}, [navigate]);
```

### Step 2: Update manifest scope to root
**File: `public/manifest.json`**

Change the scope from `/app` to `/` so the service worker can control all navigation, while keeping the start_url as `/app`:

```json
{
  "start_url": "/app",
  "scope": "/",
  ...
}
```

This allows the service worker to properly intercept navigation requests across the entire app.

### Step 3: Bump cache version to force update
**File: `public/service-worker.js`**

Increment the cache version to ensure old cached content is cleared for existing installations:

```javascript
const CACHE_NAME = 'bitcoin-converter-cache-v7';
const APP_VERSION = '1.4.0';
```

---

## Technical Details

### Why application-level redirect works best
- **Immediate effect**: Works as soon as the new code is loaded, even if from cache
- **No service worker timing issues**: Doesn't depend on service worker update cycle
- **Fallback safe**: If the redirect somehow fails, users still see a usable page
- **Compatible with browser navigation**: Works with history API and direct navigation

### Why scope should be `/`
- The restrictive `/app` scope prevents the service worker from controlling navigation at `/`
- With scope `/`, the service worker can properly cache and serve both routes
- The `start_url` still ensures fresh PWA installations start at `/app`

### Testing
After deployment:
1. Open existing PWA installation - should redirect to `/app` automatically
2. New PWA installation should start at `/app`
3. Browser users at `/` should see the landing page normally
4. PWA users should never see the landing page

### Files affected
1. `src/pages/LandingPage.tsx` - Add PWA detection and redirect
2. `public/manifest.json` - Update scope to `/`
3. `public/service-worker.js` - Bump cache version
