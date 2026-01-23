import React from "react";
import { Coins, RefreshCw, Cpu, Lock } from "lucide-react";
import Section from "./Section";
import FeatureCard from "./FeatureCard";
const FeatureSection: React.FC = () => {
  const features = [{
    icon: Coins,
    title: "Multiple Currencies",
    description: "Convert between Bitcoin, Sats and 21+ fiat currencies instantly."
  }, {
    icon: RefreshCw,
    title: "Real-time Rates",
    description: "Always up-to-date exchange rates from trusted sources."
  }, {
    icon: Cpu,
    title: "On-Device Calculation",
    description: "All calculations are done 100% locally."
  }, {
    icon: Lock,
    title: "Privacy First",
    description: "No accounts, no tracking. Your data stays on your device."
  }];
  return <Section id="features">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">How it works</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Everything you need to calculate Bitcoin conversion rates, nothing you don't.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(feature => <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />)}
      </div>
    </Section>;
};
export default FeatureSection;