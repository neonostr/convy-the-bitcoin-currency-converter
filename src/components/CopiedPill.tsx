import React, { useEffect, useState } from 'react';

interface CopiedPillProps {
  show: boolean;
  onHide: () => void;
}

const CopiedPill: React.FC<CopiedPillProps> = ({ show, onHide }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onHide, 200); // Wait for fade out animation
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show && !visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div
        className={`
          bg-foreground/90 text-background 
          px-4 py-2 rounded-full text-sm font-medium
          shadow-lg backdrop-blur-sm
          transition-all duration-200 ease-out
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        Copied
      </div>
    </div>
  );
};

export default CopiedPill;
