
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Helper function to render text with special markdown-like anchor placeholders.
 * For example, [Neo](neo) becomes an anchor to the github profile,
 * [PWA](pwa) becomes an anchor to the PWA explanation site.
 */
function renderAboutLocalized(text: string) {
  // Replace [Neo](neo)
  text = text.replace(
    /\[Neo\]\(neo\)/g,
    '<a href="https://github.com/neonostr" class="underline font-medium" target="_blank" rel="noopener noreferrer">Neo</a>'
  );
  // Replace last [PWA](pwa) only
  const pwaAnchor = '<a href="https://what-is-a-pwa.app" class="underline font-medium" target="_blank" rel="noopener noreferrer">PWA</a>';
  // Use regex to find all [PWA](pwa), but only replace the last one
  const matches = Array.from(text.matchAll(/\[PWA\]\(pwa\)/g));
  if (matches.length > 0) {
    const lastMatchIdx = matches[matches.length - 1].index!;
    text =
      text.substring(0, lastMatchIdx) +
      pwaAnchor +
      text.substring(lastMatchIdx + '[PWA](pwa)'.length);
    // Remove all previous (if exists) [PWA](pwa) - just leave as text "PWA"
    text = text.replace(/\[PWA\]\(pwa\)/g, 'PWA');
  }
  return text.split('\n').map((line, idx) => (
    <p
      className="text-sm text-muted-foreground"
      key={idx}
      dangerouslySetInnerHTML={{ __html: line }}
    />
  ));
}

/**
 * AboutSection (for Settings/Sheet)
 */
const AboutSection = () => {
  const { t } = useLanguage();
  const aboutTitle = t('settings.about.title');
  const aboutDescription = t('settings.about.description');

  return (
    <section className="py-4 border-t">
      <h3 className="text-lg font-semibold mb-2">{aboutTitle}</h3>
      <div className="space-y-2">
        {renderAboutLocalized(aboutDescription)}
      </div>
    </section>
  );
};

export default AboutSection;
