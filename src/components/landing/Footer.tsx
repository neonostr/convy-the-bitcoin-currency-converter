import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Convy</span>
        
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> by{' '}
          <a 
            href="https://neo21.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors"
          >
            Neo
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
