
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden touch-none overscroll-none safe-area">
      <div className="flex-1 flex">
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
