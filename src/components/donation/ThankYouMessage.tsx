
import React from 'react';
import { HeartHandshake } from 'lucide-react';

const ThankYouMessage = () => {
  return (
    <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
      <HeartHandshake className="h-16 w-16 text-bitcoin-orange animate-scale-in" />
      <h2 className="text-2xl font-bold text-center">Thank you for your support! ⚡️</h2>
    </div>
  );
};

export default ThankYouMessage;
