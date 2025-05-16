
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Bitcoin } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

/**
 * AppShell is a minimal component that renders instantly while the main app loads
 * It has the exact same layout as BitcoinConverter but with skeleton loaders
 * This prevents layout shift when the real component loads
 */
const AppShell: React.FC<{ onReady?: () => void }> = ({ onReady }) => {
  const { settings } = useSettings();
  
  useEffect(() => {
    // Signal that the shell is ready, can be used for metrics
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-2">
          <Bitcoin className="text-bitcoin-orange h-8 w-8" />
          <h1 className="text-2xl font-bold">Bitcoin Converter</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {/* Settings icon placeholder */}
          <div className="w-4 h-4 rounded-sm bg-muted-foreground/40"></div>
        </div>
      </div>

      <div className="w-full mb-6">
        <Skeleton className="h-16 w-full" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16" />
        ))}
      </div>

      <Skeleton className="h-4 w-48 mb-4" />

      <div className="w-full space-y-4">
        {Array(Math.min(settings?.displayCurrencies?.length || 4, 4)).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      
      <Skeleton className="h-4 w-64 mt-4 mb-4" />
    </div>
  );
};

export default AppShell;
