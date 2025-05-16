
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA - detect standalone mode
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // We'll use a shorter transition for browser mode
  const [isFullyLoaded, setIsFullyLoaded] = useState(isPWA);
  
  useEffect(() => {
    if (isPWA) {
      // In PWA mode, immediately hide the app shell and show main content
      setIsFullyLoaded(true);
      const appShell = document.getElementById('app-shell');
      if (appShell) {
        appShell.style.display = 'none';
      }
    } else {
      // If not in PWA mode, use animation frame for smooth transition
      // but make it much shorter to ensure content appears quickly
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 300); // Very short delay for shell-to-app transition
      
      return () => clearTimeout(timer);
    }
  }, [isPWA]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* App shell only shown in browser mode, for a very short time */}
      {!isPWA && (
        <div 
          id="browser-app-shell"
          className={`absolute transition-opacity duration-300 ${
            isFullyLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <AppShell onReady={() => console.log('App shell rendered')} />
        </div>
      )}
      
      {/* Real component with fade-in effect in browser mode, immediate in PWA mode */}
      <div 
        className={`w-full ${
          !isPWA ? `transition-opacity duration-300 ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}` : ''
        }`}
        aria-hidden={!isFullyLoaded}
      >
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
