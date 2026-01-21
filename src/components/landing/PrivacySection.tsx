
import React from 'react';
import { Shield, Check } from 'lucide-react';
import Section from './Section';

const PrivacySection: React.FC = () => {
  const privacyPoints = [
    'No account required',
    'Everything stored on your device',
    'No data collection or tracking',
    'Open source code',
  ];

  return (
    <Section className="bg-muted/50">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Your data stays yours
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-lg">
          Complete privacy by design. No accounts, no tracking, no compromise.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md">
          {privacyPoints.map((point) => (
            <div key={point} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-foreground">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PrivacySection;
