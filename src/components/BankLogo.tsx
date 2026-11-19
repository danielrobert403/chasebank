import React from 'react';

interface BankLogoProps {
  className?: string;
  brandName?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({
  className = '',
  brandName = 'MY DREAM BANK',
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Brand Text: Uppercase Bold Sans matching Chase typeface */}
      <span className="font-extrabold tracking-[0.14em] uppercase text-[17px] text-white font-sans leading-none">
        {brandName}
      </span>

      {/* Iconic 4-piece Octagon Emblem in crisp solid white */}
      <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-6 h-6" fill="white">
          {/* Top Trapezoid */}
          <polygon points="29,5 71,5 64,36 36,36" />
          {/* Right Trapezoid */}
          <polygon points="95,29 95,71 64,64 64,36" />
          {/* Bottom Trapezoid */}
          <polygon points="71,95 29,95 36,64 64,64" />
          {/* Left Trapezoid */}
          <polygon points="5,71 5,29 36,36 36,64" />
        </svg>
      </div>
    </div>
  );
};
