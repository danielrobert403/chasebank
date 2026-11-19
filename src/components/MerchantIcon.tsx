import React from 'react';
import { Landmark, ShoppingCart, Fuel, Coffee, ShoppingBag, Smartphone, Car, Disc3, AudioLines } from 'lucide-react';

interface MerchantIconProps {
  type: string;
  className?: string;
}

export const MerchantIcon: React.FC<MerchantIconProps> = ({ type, className = 'w-9 h-9' }) => {
  switch (type) {
    case 'spotify':
      return (
        <div className={`${className} rounded-full bg-[#1DB954] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <AudioLines className="w-4 h-4 text-white stroke-[2.5]" />
        </div>
      );
    case 'lava':
      return (
        <div className={`${className} rounded-full bg-[#991B1B] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Disc3 className="w-4 h-4 text-amber-200" />
        </div>
      );
    case 'republic':
      return (
        <div className={`${className} rounded-full bg-[#0F172A] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Disc3 className="w-4 h-4 text-sky-300" />
        </div>
      );
    case 'starbucks':
      return (
        <div className={`${className} rounded-full bg-[#00704A] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Coffee className="w-4 h-4 text-white" />
        </div>
      );
    case 'amazon':
      return (
        <div className={`${className} rounded-full bg-[#232F3E] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <span className="font-extrabold text-amber-400 text-sm italic tracking-tight font-sans">a</span>
        </div>
      );
    case 'deposit':
      return (
        <div className={`${className} rounded-full bg-[#0A4D8C] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Landmark className="w-4 h-4 text-white" />
        </div>
      );
    case 'shell':
      return (
        <div className={`${className} rounded-full bg-[#FFD100] flex items-center justify-center text-[#DD1D21] shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Fuel className="w-4 h-4 text-[#DD1D21]" />
        </div>
      );
    case 'netflix':
      return (
        <div className={`${className} rounded-full bg-black flex items-center justify-center shrink-0 shadow-xs ring-1 ring-black/5`}>
          <span className="font-black text-[#E50914] text-sm font-sans tracking-tight">N</span>
        </div>
      );
    case 'apple':
      return (
        <div className={`${className} rounded-full bg-neutral-900 flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Smartphone className="w-4 h-4 text-white" />
        </div>
      );
    case 'grocery':
      return (
        <div className={`${className} rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
      );
    case 'uber':
      return (
        <div className={`${className} rounded-full bg-black flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Car className="w-4 h-4 text-white" />
        </div>
      );
    case 'transfer':
      return (
        <div className={`${className} rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-black/5`}>
          <Landmark className="w-4 h-4 text-white" />
        </div>
      );
    default:
      return (
        <div className={`${className} rounded-full bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-xs ring-1 ring-black/5`}>
          <ShoppingCart className="w-4 h-4 text-slate-600" />
        </div>
      );
  }
};
