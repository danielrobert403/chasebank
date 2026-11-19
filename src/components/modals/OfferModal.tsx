import React, { useState } from 'react';
import { X, CheckCircle2, Plane, Sparkles, Percent, ShieldCheck } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose }) => {
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A3A6B] to-[#104382] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base sm:text-lg">Exclusive Cardmember Offer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close offer modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-[#0C356A] to-[#104382] p-2 flex flex-col justify-between shrink-0 shadow-sm border border-blue-900/40 text-white">
              <span className="text-[7px] font-black uppercase text-blue-200">DREAM</span>
              <span className="text-[7px] font-mono text-right">VISA</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                5% Cash Back on Travel
              </h4>
              <p className="text-xs text-slate-500">
                With your Dream Freedom Unlimited® card
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-blue-950">
              Maximize your rewards this holiday season:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600">
              <li>Earn 5% total cash back on flights, hotels, cruises, and car rentals booked through My Dream Travel portal.</li>
              <li>3% cash back on drugstore purchases and dining at restaurants, takeout & delivery.</li>
              <li>1.5% unlimited cash back on all other purchases.</li>
              <li>Rewards do not expire as long as your account remains open.</li>
            </ul>
          </div>

          {activated ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">5% Travel Bonus Activated!</p>
                <p className="text-[11px] text-emerald-700">
                  Bonus rate is now applied automatically to your Dream Freedom card (···9012).
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActivated(true)}
              className="w-full bg-[#0A4D8C] hover:bg-[#083E72] text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
            >
              Activate 5% Bonus Now
            </button>
          )}

          <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
            *Terms and conditions apply. Cash back bonus points will be credited within 1-2 billing cycles following travel purchase confirmation.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
