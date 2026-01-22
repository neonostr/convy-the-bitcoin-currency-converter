import React from 'react';
import { Heart } from 'lucide-react';
import Section from './Section';
import { Button } from '@/components/ui/button';

interface SupportSectionProps {
  onDonateClick: () => void;
}

const SupportSection: React.FC<SupportSectionProps> = ({ onDonateClick }) => {
  return (
    <Section className="bg-muted/30">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Free forever
        </h2>
        
        <p className="text-muted-foreground mb-8">
          Convy is completely free and open source. No ads, no subscriptions. 
          If you find it useful, consider supporting development.
        </p>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={onDonateClick}
          className="h-12 px-8 gap-2"
        >
          <Heart className="w-4 h-4" />
          Support Convy
        </Button>
      </div>
    </Section>
  );
};

export default SupportSection;
