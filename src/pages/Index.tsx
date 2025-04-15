
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import { logAppAccess } from "@/services/analyticsService";

const Index = () => {
  // Apply the theme saved in local storage on initial page load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(savedTheme);
    
    // Log app access
    logAppAccess();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <BitcoinConverter />
    </div>
  );
};

export default Index;
