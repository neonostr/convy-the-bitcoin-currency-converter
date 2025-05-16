
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA - detect standalone mode
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // In PWA mode, we start with fully loaded state true to skip animation completely
  const [isFullyLoaded, setIsFullyLoaded] = useState(isPWA);
  
  useEffect(() => {
    if (isPWA) {
      // In PWA mode, immediately show main content with no transition
      setIsFullyLoaded(true);
      const appShell = document.getElementById('app-shell');
      if (appShell) {
        appShell.style.display = 'none';
      }
    } else {
      // In browser mode, use a very short transition
      // This ensures the main content appears quickly
      setTimeout(() => {
        setIsFullyLoaded(true);
      }, 100); // Very short delay for better perceived performance
    }
  }, [isPWA]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* App shell only shown briefly in browser mode */}
      {!isPWA && (
        <div 
          id="browser-app-shell"
          className={`fixed inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${
            isFullyLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <AppShell onReady={() => console.log('App shell rendered')} />
        </div>
      )}
      
      {/* Main content - immediately visible in PWA, fades in for browser */}
      <div 
        className={`w-full ${
          !isPWA ? `transition-opacity duration-200 ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}` : ''
        }`}
        aria-hidden={!isFullyLoaded}
      >
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
