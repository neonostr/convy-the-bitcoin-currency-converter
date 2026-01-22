import React from 'react';
import { Check } from 'lucide-react';
import Section from './Section';

const PrivacySection: React.FC = () => {
  const privacyPoints = [
    'No account required',
    'Everything stored locally',
    'No data collection',
    'Open source code',
  ];

  return (
    <Section className="bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Your data stays <span className="text-primary">yours</span>
          </h2>
          <p className="text-muted-foreground">
            Complete privacy by design. No compromise.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {privacyPoints.map((point) => (
            <div key={point} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-foreground text-sm font-medium">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PrivacySection;
