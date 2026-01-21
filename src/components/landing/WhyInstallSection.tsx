
import React from 'react';
import { Zap, Save, Gauge, Smartphone } from 'lucide-react';
import Section from './Section';
import FeatureCard from './FeatureCard';
import { Button } from '@/components/ui/button';

interface WhyInstallSectionProps {
  onInstallClick: () => void;
}

const WhyInstallSection: React.FC<WhyInstallSectionProps> = ({ onInstallClick }) => {
  const benefits = [
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'One tap from your home screen.',
    },
    {
      icon: Save,
      title: 'Remember Settings',
      description: 'Your preferences persist between sessions.',
    },
    {
      icon: Gauge,
      title: 'Faster Load',
      description: 'Works even with poor connection.',
    },
    {
      icon: Smartphone,
      title: 'Native Feel',
      description: 'Full-screen, no browser UI.',
    },
  ];

  return (
    <Section>
      <h2 className="text-3xl font-bold text-foreground text-center mb-4">
        Why Install?
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
        Get the best experience by installing Convy on your device.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {benefits.map((benefit) => (
          <FeatureCard
            key={benefit.title}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
          />
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-8"
          onClick={onInstallClick}
        >
          Install Convy
        </Button>
      </div>
    </Section>
  );
};

export default WhyInstallSection;
