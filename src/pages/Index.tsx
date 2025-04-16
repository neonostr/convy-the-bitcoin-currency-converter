
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  // Apply the theme saved in local storage on initial page load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add(savedTheme);
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-background">
      <BitcoinConverter />
    </div>
  );
};

export default Index;
