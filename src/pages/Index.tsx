
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA - detect standalone mode
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // In PWA mode, we start with fully loaded state true to skip the animation
  // In browser mode, we start with false to show the animation
  const [isFullyLoaded, setIsFullyLoaded] = useState(isPWA);
  
  useEffect(() => {
    // In PWA mode, immediately hide the app shell
    if (isPWA) {
      setIsFullyLoaded(true);
      const appShell = document.getElementById('app-shell');
      if (appShell) {
        appShell.style.display = 'none';
      }
    } else {
      // If not in PWA mode, use animation frame for smooth transition
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 300); // Short delay for shell-to-app transition
      
      return () => clearTimeout(timer);
    }
  }, [isPWA]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* App shell only shown in browser mode */}
      {!isPWA && (
        <div 
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
