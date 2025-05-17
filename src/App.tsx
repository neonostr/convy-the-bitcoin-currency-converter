
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import { LanguageProvider } from "@/hooks/useLanguage";

// Import Index directly for faster initial render
import Index from "./pages/Index";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));

// Pre-configure query client for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (previously cacheTime)
      retry: 2, // Reduce retry attempts for faster feedback
      retryDelay: 1000, // Shorter retry delay
      networkMode: 'online', // Don't waste time retrying when offline
    },
  },
});

// Initialize service worker sync in a non-blocking way
if (typeof window !== 'undefined') {
  // Wait until after page is visible and interactive
  window.addEventListener('load', () => {
    setTimeout(() => {
      import("@/services/ratesService").then(module => {
        module.initializeServiceWorkerSync();
      });
    }, 5000);
  });
}

// Critical UI components that need to be rendered immediately
const CriticalUI = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="*" element={
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <NotFound />
      </Suspense>
    } />
  </Routes>
);

// Non-critical UI components that can be deferred
const NonCriticalUI = () => (
  <>
    <Toaster />
    <Sonner />
  </>
);

const App = () => {
  // Check if we're in PWA mode
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SettingsProvider>
          <TooltipProvider>
            {/* Render the critical UI immediately */}
            <BrowserRouter>
              <CriticalUI />
            </BrowserRouter>
            
            {/* Defer non-critical UI components */}
            <Suspense fallback={null}>
              <NonCriticalUI />
            </Suspense>
          </TooltipProvider>
        </SettingsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
