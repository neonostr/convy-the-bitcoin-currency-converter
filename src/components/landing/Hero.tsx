import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroProps {
  onInstallClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInstallClick }) => {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-20">
      <h1 className="text-5xl md:text-7xl font-light tracking-tight text-foreground text-center mb-6">
        Convy
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground text-center mb-12 max-w-md font-light">
        Bitcoin to fiat, instantly. No ads, no tracking.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link to="/app">
          <Button 
            size="lg" 
            className="px-8 h-12 text-base font-normal"
          >
            Open App
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="px-8 h-12 text-base font-normal"
          onClick={onInstallClick}
        >
          Install
        </Button>
      </div>
    </section>
  );
};

export default Hero;
