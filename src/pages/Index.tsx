
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Track whether the full component has loaded
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  
  useEffect(() => {
    // Mark the component as loaded as soon as it mounts
    // We'll fade in the real content after a minimal delay
    const timer = requestAnimationFrame(() => {
      setIsFullyLoaded(true);
    });
    
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* Always render the shell for instant visual feedback */}
      <div className={`absolute transition-opacity duration-300 ${isFullyLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <AppShell onReady={() => console.log('App shell rendered')} />
      </div>
      
      {/* Real component with fade-in effect */}
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
