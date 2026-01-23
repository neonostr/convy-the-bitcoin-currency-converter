import BitcoinConverter from "@/components/BitcoinConverter";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const Index = () => {
  const { isInstalled } = useInstallPrompt();
  
  // Only add vertical padding on desktop when NOT installed as PWA
  const containerClasses = isInstalled 
    ? "flex h-[100dvh] items-center justify-center p-4 bg-background overflow-hidden"
    : "flex h-[100dvh] items-center justify-center p-4 md:py-12 lg:py-16 bg-background overflow-hidden";

  return (
    <div className={containerClasses}>
      <BitcoinConverter />
    </div>
  );
};

export default Index;
