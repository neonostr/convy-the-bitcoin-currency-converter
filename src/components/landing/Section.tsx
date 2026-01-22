import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({ children, className, id }) => {
  return (
    <section id={id} className={cn("py-20 px-6", className)}>
      <div className="max-w-5xl mx-auto">
        {children}
      </div>
    </section>
  );
};

export default Section;
