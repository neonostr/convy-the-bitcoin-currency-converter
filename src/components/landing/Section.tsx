
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({ children, className, id }) => {
  return (
    <section id={id} className={cn("py-16 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </section>
  );
};

export default Section;
