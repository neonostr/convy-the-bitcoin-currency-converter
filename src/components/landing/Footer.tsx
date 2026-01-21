
import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by{' '}
          <a 
            href="https://neo21.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Neo
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
