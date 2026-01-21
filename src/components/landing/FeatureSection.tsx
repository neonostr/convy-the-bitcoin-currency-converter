
import React from 'react';
import { Coins, RefreshCw, WifiOff } from 'lucide-react';
import Section from './Section';
import FeatureCard from './FeatureCard';

const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: Coins,
      title: 'Multiple Currencies',
      description: 'Convert between Bitcoin, Sats and 15+ fiat currencies with ease.',
    },
    {
      icon: RefreshCw,
      title: 'Real-time Rates',
      description: 'Always up-to-date exchange rates from trusted sources.',
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'Access your converter anytime, even without internet.',
    },
  ];

  return (
    <Section>
      <h2 className="text-3xl font-bold text-foreground text-center mb-4">
        Simple & Powerful
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
        Everything you need to convert Bitcoin, nothing you don't.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Section>
  );
};

export default FeatureSection;
