
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // In PWA mode, always start fully loaded with no transitions
  const [isFullyLoaded, setIsFullyLoaded] = useState(isPWA);
  
  useEffect(() => {
    // If not in PWA mode, handle the fade-in effect
    if (!isPWA) {
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 100); // Shorter timeout for better perceived performance
      
      return () => clearTimeout(timer);
    }
  }, [isPWA]);

  // In PWA mode, render only the BitcoinConverter with no transitions
  if (isPWA) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background pwa-mode">
        <BitcoinConverter />
      </div>
    );
  }

  // In browser mode, show both with transition
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {!isFullyLoaded && (
        <div className="absolute transition-opacity duration-300 opacity-100">
          <AppShell onReady={() => console.log('App shell rendered')} />
        </div>
      )}
      
      <div 
        className={`w-full transition-opacity duration-300 ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!isFullyLoaded}
      >
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
