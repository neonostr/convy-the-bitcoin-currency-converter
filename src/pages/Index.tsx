
import { useState } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  // Check if running as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  // For PWA mode, render immediately without any state or effects
  if (isPWA) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
        <BitcoinConverter />
      </div>
    );
  }
  
  // For browser mode, we can afford a nicer transition
  const [isLoaded, setIsLoaded] = useState(false);

  // In browser mode, show immediately without additional effects
  // This simplifies the component and reduces render steps
  if (!isLoaded) {
    // Use requestAnimationFrame for smoother transition in browser mode
    requestAnimationFrame(() => setIsLoaded(true));
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {isLoaded ? <BitcoinConverter /> : null}
    </div>
  );
};

export default Index;
