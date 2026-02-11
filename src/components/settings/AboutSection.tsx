import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

/**
 * Helper function to render text with special markdown-like anchor placeholders.
 * For example, [Neo](neo) becomes an anchor to the github profile,
 * [PWA](pwa) becomes an anchor to the PWA explanation site.
 */
function renderAboutLocalized(text: string) {
  // Replace [Neo](neo)
  text = text.replace(/\[Neo\]\(neo\)/g, '<a href="https://neo21.dev" class="underline font-medium" target="_blank" rel="noopener noreferrer">Neo</a>');
  // Replace last [PWA](pwa) only
  const pwaAnchor = '<a href="https://what-is-a-pwa.app" class="underline font-medium" target="_blank" rel="noopener noreferrer">PWA</a>';
  // Use regex to find all [PWA](pwa), but only replace the last one
  const matches = Array.from(text.matchAll(/\[PWA\]\(pwa\)/g));
  if (matches.length > 0) {
    const lastMatchIdx = matches[matches.length - 1].index!;
    text = text.substring(0, lastMatchIdx) + pwaAnchor + text.substring(lastMatchIdx + '[PWA](pwa)'.length);
    // Remove all previous (if exists) [PWA](pwa) - just leave as text "PWA"
    text = text.replace(/\[PWA\]\(pwa\)/g, 'PWA');
  }
  return <p dangerouslySetInnerHTML={{
    __html: text
  }} className="text-muted-foreground text-sm" />;
}

/**
 * AboutSection (for Settings/Sheet)
 */
const AboutSection = () => {
  const {
    t
  } = useLanguage();
  const aboutTitle = t('settings.about.title');
  const aboutDescription = t('settings.about.description');
  const checkOutMyApps = t('settings.about.checkOutMyApps');
  
  return <section className="py-4 border-t">
      <h3 className="text-lg font-semibold mb-2">{aboutTitle}</h3>
      <div className="space-y-4">
        {renderAboutLocalized(aboutDescription)}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => window.open('https://neo21.dev', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {checkOutMyApps}
        </Button>
      </div>
    </section>;
};
export default AboutSection;