
import { useEffect, useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  // Check if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  // For PWA mode, we always set isLoaded to true for immediate rendering
  // For browser mode, we can afford a nicer transition
  const [isLoaded, setIsLoaded] = useState(isPWA ? true : false);

  useEffect(() => {
    // In browser mode, we show a brief loading transition
    if (!isPWA && !isLoaded) {
      const timer = setTimeout(() => setIsLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isPWA, isLoaded]);

  // In PWA mode, render immediately without any transitions or delays
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {(isPWA || isLoaded) ? <BitcoinConverter /> : null}
    </div>
  );
};

export default Index;
