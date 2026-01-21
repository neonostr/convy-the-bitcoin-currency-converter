
import React from 'react';
import { cn } from '@/lib/utils';

export type BrowserType = 'safari' | 'chrome' | 'edge' | 'other';

interface BrowserTabsProps {
  selectedBrowser: BrowserType;
  onBrowserChange: (browser: BrowserType) => void;
}

const browsers: { id: BrowserType; label: string }[] = [
  { id: 'safari', label: 'Safari' },
  { id: 'chrome', label: 'Chrome' },
  { id: 'edge', label: 'Edge' },
  { id: 'other', label: 'Other' },
];

const BrowserTabs: React.FC<BrowserTabsProps> = ({ selectedBrowser, onBrowserChange }) => {
  return (
    <div className="flex rounded-lg bg-muted p-1 gap-1">
      {browsers.map((browser) => (
        <button
          key={browser.id}
          onClick={() => onBrowserChange(browser.id)}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            selectedBrowser === browser.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {browser.label}
        </button>
      ))}
    </div>
  );
};

export default BrowserTabs;
