import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4 md:p-12 lg:p-20">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
