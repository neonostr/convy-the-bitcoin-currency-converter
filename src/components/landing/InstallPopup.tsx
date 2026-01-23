import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, Download, Share, MoreVertical, Plus, ExternalLink } from 'lucide-react';
import BrowserTabs, { BrowserType } from './BrowserTabs';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
interface InstallPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const InstallPopup: React.FC<InstallPopupProps> = ({
  open,
  onOpenChange
}) => {
  const {
    getBrowser,
    promptInstall,
    hasNativePrompt,
    isIOS,
    isInstalled
  } = useInstallPrompt();
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>('safari');
  const [helpOpen, setHelpOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [autoInstallAttempted, setAutoInstallAttempted] = useState(false);

  // Auto-trigger native install prompt when dialog opens and browser supports it
  useEffect(() => {
    if (open && hasNativePrompt && !autoInstallAttempted && !isInstalled) {
      setAutoInstallAttempted(true);
      handleInstall();
    }
  }, [open, hasNativePrompt, autoInstallAttempted, isInstalled]);
  useEffect(() => {
    if (open) {
      setSelectedBrowser(getBrowser());
    }
  }, [open]);

  // Reset auto-install flag when dialog closes
  useEffect(() => {
    if (!open) {
      setAutoInstallAttempted(false);
    }
  }, [open]);
  const handleInstall = async () => {
    if (hasNativePrompt) {
      setIsInstalling(true);
      const success = await promptInstall();
      setIsInstalling(false);
      if (success) {
        onOpenChange(false);
      }
    }
  };
  if (isInstalled) {
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm rounded-xl">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <a href="https://github.com/neonostr/convy-the-bitcoin-currency-converter" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                <Github className="w-3.5 h-3.5" />
                Free & Open Source
              </a>
            </div>
            <DialogTitle className="text-center text-xl">Already Installed!</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground">
            Convy is already installed on your device. Look for it on your home screen!
          </p>
        </DialogContent>
      </Dialog>;
  }
  const renderBrowserInstructions = () => {
    if (selectedBrowser === 'safari') {
      return <div className="space-y-4">
          
          
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
              <span className="text-foreground">Tap the <Share className="w-4 h-4 inline mx-1" /> Share button at the bottom of Safari</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
              <span className="text-foreground">Scroll down and tap "Add to Home Screen"</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
              <span className="text-foreground">Tap "Add" in the top-right corner</span>
            </li>
          </ol>
          
          {isIOS && <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              💡 Safari is the only browser that can install PWAs on iOS
            </p>}
        </div>;
    }
    if (selectedBrowser === 'chrome') {
      return <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4 flex items-center justify-center">
            <div className="flex items-center gap-4 text-muted-foreground">
              <MoreVertical className="w-8 h-8" />
              <span className="text-2xl">→</span>
              <div className="flex items-center gap-1 bg-background rounded-lg px-3 py-2">
                <Download className="w-5 h-5" />
                <span className="text-sm">Install app</span>
              </div>
            </div>
          </div>
          
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
              <span className="text-foreground">Look for the install icon <Plus className="w-4 h-4 inline mx-1" /> in the address bar</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
              <span className="text-foreground">Click it and select "Install"</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
              <span className="text-foreground">Or use menu → More tools → Create shortcut</span>
            </li>
          </ol>
          
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 The install icon appears after a few seconds on the page
          </p>
        </div>;
    }
    if (selectedBrowser === 'edge') {
      return <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4 flex items-center justify-center">
            <div className="flex items-center gap-4 text-muted-foreground">
              <MoreVertical className="w-8 h-8" />
              <span className="text-2xl">→</span>
              <div className="flex items-center gap-1 bg-background rounded-lg px-3 py-2">
                <ExternalLink className="w-5 h-5" />
                <span className="text-sm">Apps → Install</span>
              </div>
            </div>
          </div>
          
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
              <span className="text-foreground">Look for the install icon <Plus className="w-4 h-4 inline mx-1" /> in the address bar</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
              <span className="text-foreground">Click "Install" when prompted</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
              <span className="text-foreground">Or use menu → Apps → Install this site</span>
            </li>
          </ol>
          
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            💡 Edge has excellent PWA support with automatic updates
          </p>
        </div>;
    }

    // Other browsers
    return <div className="space-y-4">
        <div className="bg-muted rounded-xl p-4 flex items-center justify-center">
          <div className="flex items-center gap-4 text-muted-foreground">
            <MoreVertical className="w-8 h-8" />
            <span className="text-2xl">→</span>
            <div className="flex items-center gap-1 bg-background rounded-lg px-3 py-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Install / Add to Home</span>
            </div>
          </div>
        </div>
        
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
            <span className="text-foreground">Open your browser's menu (usually ⋮ or ⋯)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
            <span className="text-foreground">Look for "Install app" or "Add to Home Screen"</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
            <span className="text-foreground">Follow the prompts to complete installation</span>
          </li>
        </ol>
        
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          💡 For best experience, use Chrome, Edge, or Safari
        </p>
      </div>;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader className="text-center">
          
          <DialogTitle className="text-center text-xl">Install Convy</DialogTitle>
        </DialogHeader>

        {hasNativePrompt ? <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Add Convy to your home screen for quick access and offline use.
            </p>
            <Button className="w-full" size="lg" onClick={handleInstall} disabled={isInstalling}>
              {isInstalling ? 'Installing...' : 'Install Now'}
            </Button>
          </div> : <div className="space-y-4 py-4">
            <BrowserTabs selectedBrowser={selectedBrowser} onBrowserChange={setSelectedBrowser} />
            
            {renderBrowserInstructions()}
            
            <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
              <CollapsibleTrigger className="text-sm text-muted-foreground hover:text-foreground w-full text-center py-2">
                {helpOpen ? '▼' : '▶'} Can't find the install option?
              </CollapsibleTrigger>
              <CollapsibleContent className="text-sm text-muted-foreground space-y-2 pt-2">
                <p>If you don't see an install option:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Make sure you're using a supported browser</li>
                  <li>Try refreshing the page</li>
                  <li>Check if you already have the app installed</li>
                  <li>On iOS, only Safari can install PWAs</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default InstallPopup;