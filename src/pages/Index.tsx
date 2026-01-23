
import { useEffect } from "react";
import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  return (
    <div className="flex h-[100dvh] items-center justify-center p-4 md:py-8 lg:py-12 bg-background overflow-hidden">
      <BitcoinConverter />
    </div>
  );
};

export default Index;
