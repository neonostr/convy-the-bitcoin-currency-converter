
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const { theme } = useTheme();

  // Apply theme on initial page load
  useEffect(() => {
    document.documentElement.classList.add(theme);
  }, []);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4 mx-auto">
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
