
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import { LanguageProvider } from "@/hooks/useLanguage";
import { lazy, Suspense, useMemo } from "react";

// Import Index directly instead of lazy loading for faster initial render
import Index from "./pages/Index";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  // Check if running as PWA
  const isPWA = useMemo(() => window.matchMedia('(display-mode: standalone)').matches, []);
  
  // Optimize query client config with different settings for PWA vs browser
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // Keep data fresh forever
        gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (previously cacheTime)
        retry: isPWA ? 1 : 2, // Reduce retry attempts for faster feedback in PWA mode
        retryDelay: isPWA ? 3000 : 1000, // Longer retry delay for PWA to prioritize UI
        networkMode: isPWA ? 'always' : 'online', // In PWA, don't block on network
      },
    },
  }), [isPWA]);

  return (
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
};

export default App;
