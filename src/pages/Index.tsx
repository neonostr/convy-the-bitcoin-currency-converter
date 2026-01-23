
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  return (
    <div className="flex h-[100dvh] items-center justify-center p-4 bg-background overflow-hidden touch-manipulation">
      <BitcoinConverter />
    </div>
  );
};

export default Index;
