import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Github } from "lucide-react";

interface HeroProps {
  onInstallClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onInstallClick }) => {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 pt-14">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Badge */}
        <a
          href="https://github.com/neonostr/convy-the-bitcoin-currency-converter"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          Free & Open Source
        </a>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
          <span className="text-primary">Bitcoin</span> → Anything
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A fast, private currency converter. No ads, no tracking, no accounts. Just instant conversions.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4">
          <Button size="lg" className="h-12 px-8 text-base gap-2 group" onClick={onInstallClick}>
            Install App
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <Link to="/app">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              Use Web Version
            </Button>
          </Link>
        </div>

        {/* Trust indicator */}
        <p className="text-sm text-muted-foreground/70 pt-4">Works offline · 15+ currencies · Real-time rates</p>
      </div>
    </section>
  );
};

export default Hero;
