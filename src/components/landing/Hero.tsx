import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroProps {
  onInstallClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInstallClick }) => {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 pt-20">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
          Convert <span className="text-primary">Bitcoin</span> to any currency
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          A simple, privacy-focused currency converter. No ads, no tracking, just fast conversions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4">
          <Button 
            size="lg" 
            className="px-8"
            onClick={onInstallClick}
          >
            Install App
          </Button>
          
          <Link to="/app">
            <Button variant="outline" size="lg" className="px-8">
              Try Web Version
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
