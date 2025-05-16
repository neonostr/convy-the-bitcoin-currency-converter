
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // Track whether the full component has loaded
  // In PWA mode, we start with isFullyLoaded = true to skip the fade-in
  const [isFullyLoaded, setIsFullyLoaded] = useState(isPWA);
  
  useEffect(() => {
    // If not in PWA mode, handle the fade-in effect
    if (!isPWA) {
      const timer = requestAnimationFrame(() => {
        setIsFullyLoaded(true);
      });
      
      return () => cancelAnimationFrame(timer);
    }
  }, [isPWA]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* Only show AppShell in browser mode, not in PWA mode */}
      {!isPWA && (
        <div className={`absolute transition-opacity duration-300 ${isFullyLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <AppShell onReady={() => console.log('App shell rendered')} />
        </div>
      )}
      
      {/* Real component with fade-in effect (only in browser mode) */}
      <div 
        className={`w-full ${!isPWA ? `transition-opacity duration-300 ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}` : ''}`}
        aria-hidden={!isFullyLoaded}
      >
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
