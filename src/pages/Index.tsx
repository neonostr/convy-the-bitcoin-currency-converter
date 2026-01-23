import BitcoinConverter from "@/components/BitcoinConverter";

const Index = () => {
  return (
    <div className="flex h-[100dvh] items-center justify-center p-4 md:p-8 lg:p-16 bg-background overflow-hidden">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <BitcoinConverter />
      </div>
    </div>
  );
};

export default Index;
