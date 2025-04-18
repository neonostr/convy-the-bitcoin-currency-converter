
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/hooks/useSettings";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a new query client that persists cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever
      gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (previously cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
