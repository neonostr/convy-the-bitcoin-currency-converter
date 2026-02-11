import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart } from 'lucide-react';
import DonationPopup from '@/components/DonationPopup';

/**
 * Helper function to render text with special markdown-like anchor placeholders.
 */
function renderAboutLocalized(text: string) {
  text = text.replace(/\[Neo\]\(neo\)/g, '<a href="https://neo21.dev" class="underline font-medium" target="_blank" rel="noopener noreferrer">Neo</a>');
  const pwaAnchor = '<a href="https://what-is-a-pwa.app" class="underline font-medium" target="_blank" rel="noopener noreferrer">PWA</a>';
  const matches = Array.from(text.matchAll(/\[PWA\]\(pwa\)/g));
  if (matches.length > 0) {
    const lastMatchIdx = matches[matches.length - 1].index!;
    text = text.substring(0, lastMatchIdx) + pwaAnchor + text.substring(lastMatchIdx + '[PWA](pwa)'.length);
    text = text.replace(/\[PWA\]\(pwa\)/g, 'PWA');
  }
  return <p dangerouslySetInnerHTML={{ __html: text }} className="text-muted-foreground text-sm" />;
}

const AboutSection = () => {
  const { t } = useLanguage();
  const [donationOpen, setDonationOpen] = useState(false);
  const aboutTitle = t('settings.about.title');
  const aboutDescription = t('settings.about.description');
  const checkOutMyApps = t('settings.about.checkOutMyApps');
  const tipText = t('settings.about.leaveTip');
  
  return <section className="py-4 border-t">
      <h3 className="text-lg font-semibold mb-2">{aboutTitle}</h3>
      <div className="space-y-3">
        {renderAboutLocalized(aboutDescription)}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => setDonationOpen(true)}
        >
          <Heart className="mr-2 h-4 w-4" />
          {tipText}
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => window.open('https://neo21.dev', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {checkOutMyApps}
        </Button>
      </div>
      <DonationPopup open={donationOpen} onOpenChange={setDonationOpen} showTrigger={false} />
    </section>;
};
export default AboutSection;