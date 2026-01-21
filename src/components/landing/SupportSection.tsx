
import React from 'react';
import { Heart } from 'lucide-react';
import Section from './Section';
import { Button } from '@/components/ui/button';

interface SupportSectionProps {
  onDonateClick: () => void;
}

const SupportSection: React.FC<SupportSectionProps> = ({ onDonateClick }) => {
  return (
    <Section className="bg-muted/50">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Free Forever
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-lg">
          Convy is completely free and open source. No ads, no subscriptions, no hidden costs. 
          If you find it useful, consider supporting development with a small donation.
        </p>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={onDonateClick}
          className="gap-2"
        >
          <Heart className="w-4 h-4" />
          Support Convy
        </Button>
      </div>
    </Section>
  );
};

export default SupportSection;
