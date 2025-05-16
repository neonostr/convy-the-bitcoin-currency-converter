
import { useState, useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import AppShell from "@/components/AppShell";

const Index = () => {
  // Check if running as PWA
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  
  // State to control when to show the main content
  const [showContent, setShowContent] = useState(isPWA);
  
  useEffect(() => {
    // In PWA mode, immediately show content with no transitions
    if (isPWA) {
      setShowContent(true);
      return;
    }
    
    // In browser mode, show content after a short delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300); // Short delay for browser mode
    
    return () => clearTimeout(timer);
  }, [isPWA]);
  
  // In PWA mode, render only BitcoinConverter with no shell or transitions
  if (isPWA) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
        <BitcoinConverter />
      </div>
    );
  }
  
  // In browser mode, handle shell and main content visibility
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      {/* App shell - only shown initially */}
      {!showContent && (
        <div className="w-full">
          <AppShell />
        </div>
      )}
      
      {/* Main content - becomes visible when ready */}
      <div 
        className={`w-full transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0 hidden'}`}
      >
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
