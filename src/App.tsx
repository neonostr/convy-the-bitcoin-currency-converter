
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import { lazy, Suspense } from "react";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimize query client config for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
      retry: 1, // Minimal retry
      networkMode: 'online', // Don't waste time retrying when offline
    },
  },
});

// Create a minimal empty window.showToast for the service worker to use
if (typeof window !== 'undefined') {
  (window as any).showToast = (window as any).showToast || function(opts: any) {
    console.log('Toast:', opts.title, opts.description);
  };
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <SettingsProvider>
        <TooltipProvider>
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
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </SettingsProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
