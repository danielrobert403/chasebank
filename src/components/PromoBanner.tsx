import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PromoBannerProps {
  onLearnMore: () => void;
  brandTheme: 'dream' | 'chase';
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onLearnMore, brandTheme }) => {
  const brandName = brandTheme === 'chase' ? 'Chase' : 'Dream';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3.5">
        {/* Miniature Freedom Card Thumbnail */}
        <div className="w-14 h-9 rounded-md bg-gradient-to-r from-[#0C356A] via-[#0E4383] to-[#0A2F60] p-1.5 flex flex-col justify-between shrink-0 shadow-xs text-white">
          <div className="flex items-center justify-between">
            <span className="text-[6px] font-black uppercase tracking-wider text-white">
              {brandTheme === 'chase' ? 'CHASE' : 'DREAM'}
            </span>
            <span className="text-[6px] font-serif italic text-white">freedom</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[6px] font-mono text-blue-200">··· 9012</span>
            <span className="text-[6px] font-bold italic text-white font-serif">VISA</span>
          </div>
        </div>

        {/* Headline & Terms */}
        <div>
          <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 leading-tight">
            Earn 5% cash back on travel
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            With {brandName} Freedom Unlimited®. Terms apply.
          </p>
        </div>
      </div>

      {/* Action Link matching screenshot */}
      <button
        onClick={onLearnMore}
        className="text-xs sm:text-[13px] font-semibold text-[#1170C3] hover:text-[#0D5CA0] hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 self-end sm:self-center"
      >
        <span>Learn more</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
