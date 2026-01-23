import React from 'react';
import { Zap, Database, Gauge, Smartphone } from 'lucide-react';
import Section from './Section';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface WhyInstallSectionProps {
  onInstallClick: () => void;
}

const WhyInstallSection: React.FC<WhyInstallSectionProps> = ({ onInstallClick }) => {
  const benefits = [
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'One tap from your home screen',
    },
    {
      icon: Database,
      title: 'Persistent Settings',
      description: 'Your preferences are saved',
    },
    {
      icon: Gauge,
      title: 'Faster Performance',
      description: 'Works even offline',
    },
    {
      icon: Smartphone,
      title: 'Native Experience',
      description: 'Full-screen, no browser UI',
    },
  ];

  return (
    <Section id="install">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Install for the best experience
          </h2>
          <p className="text-muted-foreground">
            Add Convy to your home screen for instant access.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="h-12 px-8 gap-2"
            onClick={onInstallClick}
          >
            Install Convy
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default WhyInstallSection;
