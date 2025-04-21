
import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ThankYouMessage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
      <HeartHandshake className="h-16 w-16 text-bitcoin-orange animate-scale-in" />
      <h2 className="text-2xl font-bold text-center">{t('donation.thankYou.title')}</h2>
      <p className="text-center text-muted-foreground">{t('donation.thankYou.subtitle')}</p>
    </div>
  );
};

export default ThankYouMessage;
