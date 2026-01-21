
import React, { useState } from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import FeatureSection from '@/components/landing/FeatureSection';
import PrivacySection from '@/components/landing/PrivacySection';
import WhyInstallSection from '@/components/landing/WhyInstallSection';
import SupportSection from '@/components/landing/SupportSection';
import Footer from '@/components/landing/Footer';
import InstallPopup from '@/components/landing/InstallPopup';
import LandingDonationPopup from '@/components/landing/LandingDonationPopup';

const LandingPage: React.FC = () => {
  const [installOpen, setInstallOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <Hero onInstallClick={() => setInstallOpen(true)} />
        <FeatureSection />
        <PrivacySection />
        <WhyInstallSection onInstallClick={() => setInstallOpen(true)} />
        <SupportSection onDonateClick={() => setDonationOpen(true)} />
      </main>
      
      <Footer />
      
      <InstallPopup 
        open={installOpen} 
        onOpenChange={setInstallOpen} 
      />
      
      <LandingDonationPopup 
        open={donationOpen} 
        onOpenChange={setDonationOpen} 
      />
    </div>
  );
};

export default LandingPage;
