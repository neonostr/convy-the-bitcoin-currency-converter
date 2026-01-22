import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
const Header: React.FC = () => {
  const {
    theme,
    setTheme
  } = useTheme();
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="w-full px-6 h-14 flex items-center justify-between">
        <span className="text-base font-medium text-foreground tracking-tight">
          Convy
        </span>
        
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>;
};
export default Header;