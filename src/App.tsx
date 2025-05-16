
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import { LanguageProvider } from "@/hooks/useLanguage";
import { lazy, Suspense } from "react";

// Import Index directly instead of lazy loading for faster initial render
import Index from "./pages/Index";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimize query client config for faster startup
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
  // Defer the service worker initialization to after rendering
  setTimeout(() => {
    import("@/services/ratesService").then(module => {
      module.initializeServiceWorkerSync();
    });
  }, 3000);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={
                <Suspense fallback={<div className="p-4">Loading...</div>}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
