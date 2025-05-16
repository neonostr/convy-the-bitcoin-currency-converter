
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA - detect standalone mode
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // In PWA mode, we skip the loading state entirely
  const [isFullyLoaded, setIsFullyLoaded] = useState(isPWA);
  
  useEffect(() => {
    if (isPWA) {
      // In PWA mode, immediately show main content
      setIsFullyLoaded(true);
    } else {
      // In browser mode, allow a minimal delay before showing main content
      // Just enough time for AppShell to render first
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isPWA]);

  // In PWA mode, just return the BitcoinConverter directly - no transitions
  if (isPWA) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
        <BitcoinConverter />
      </div>
    );
  }
  
  // In browser mode, handle the transition between app shell and main content
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* App shell - visible until main content loads */}
      <div 
        id="browser-app-shell"
        className={`fixed inset-0 z-10 flex items-center justify-center bg-background transition-opacity duration-300 ${
          isFullyLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <AppShell onReady={() => console.log('App shell rendered')} />
      </div>
      
      {/* Main content - hidden until fully loaded */}
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
