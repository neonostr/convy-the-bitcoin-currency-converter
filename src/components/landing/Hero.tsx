
import React from 'react';
import { Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroProps {
  onInstallClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInstallClick }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/25">
        <Bitcoin className="w-14 h-14 text-primary-foreground" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4 max-w-2xl">
        Convert Bitcoin to any currency instantly
      </h1>
      
      <p className="text-lg text-muted-foreground text-center mb-8 max-w-xl">
        A simple, privacy-focused Bitcoin currency converter. No ads, no tracking, just conversions.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg font-semibold"
          onClick={onInstallClick}
        >
          Install App
        </Button>
        
        <Link to="/app">
          <Button variant="ghost" size="lg" className="text-muted-foreground">
            Try Web Version
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
