
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-background overflow-hidden touch-manipulation">
      <BitcoinConverter />
    </div>
  );
};

export default Index;
