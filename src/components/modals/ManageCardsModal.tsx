import React, { useState } from 'react';
import { X, CreditCard, Lock, Unlock, Shield, Eye, EyeOff, Plane, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';
import { BankAccount } from '../../types/bank';

interface ManageCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onToggleCardFreeze: (accountId: string) => void;
}

export const ManageCardsModal: React.FC<ManageCardsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onToggleCardFreeze,
}) => {
  const creditAccount = accounts.find(a => a.type === 'credit') || accounts[0];
  const [selectedCardId, setSelectedCardId] = useState(creditAccount.id);
  const [showFullCard, setShowFullCard] = useState(false);
  const [travelNoticeSet, setTravelNoticeSet] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const currentAcc = accounts.find(a => a.id === selectedCardId) || creditAccount;
  const isFrozen = currentAcc.isLocked || currentAcc.cardDetails?.isFrozen;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#0A3A6B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base sm:text-lg">Manage Cards & Security</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close card manager modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Card Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Card to Manage
            </label>
            <div className="grid grid-cols-2 gap-3">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedCardId(acc.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedCardId === acc.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{acc.name}</p>
                  <p className="text-[11px] font-mono text-slate-500">···· {acc.lastFour}</p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                    acc.isLocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {acc.isLocked ? 'Frozen' : 'Active'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Realistic Card Preview with Flip/Details */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0C356A] via-[#104382] to-[#0A2647] text-white p-6 shadow-md border border-blue-900/40">
            {isFrozen && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-10">
                <div className="bg-red-600/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg">
                  <Lock className="w-4 h-4" /> Card is Locked / Frozen
                </div>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] tracking-widest font-black uppercase text-blue-200">MY DREAM BANK</span>
                <p className="text-sm font-serif italic text-white">{currentAcc.name}</p>
              </div>
              <span className="font-black italic text-base font-serif text-white">VISA</span>
            </div>

            <div className="my-6">
              <span className="text-xs text-blue-200/80 block mb-1">Card Number</span>
              <span className="font-mono text-base sm:text-lg tracking-widest font-semibold">
                {showFullCard
                  ? (currentAcc.fullAccountNumber.replace(/(\d{4})/g, '$1 ').trim())
                  : `•••• •••• •••• ${currentAcc.lastFour}`}
              </span>
            </div>

            <div className="flex justify-between items-end text-xs">
              <div>
                <span className="text-[10px] text-blue-200/80 uppercase block">Cardholder</span>
                <span className="font-semibold tracking-wider font-mono">
                  {currentAcc.cardDetails?.cardholderName || 'MICHAEL R MORGAN'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-blue-200/80 uppercase block">Expires</span>
                <span className="font-mono font-semibold">
                  {currentAcc.cardDetails?.expiryDate || '10/29'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-blue-200/80 uppercase block">CVV</span>
                <span className="font-mono font-semibold">
                  {showFullCard ? (currentAcc.cardDetails?.cvv || '842') : '•••'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Security Controls */}
          <div className="space-y-3">
            {/* Lock / Freeze Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  isFrozen ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isFrozen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Lock / Freeze Card</h4>
                  <p className="text-[11px] text-slate-500">
                    Instantly block all new purchases and ATM withdrawals. Recurring auto-pay remains unaffected.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onToggleCardFreeze(currentAcc.id);
                  triggerToast(isFrozen ? 'Card has been unlocked.' : 'Card has been frozen.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isFrozen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isFrozen ? 'Unlock' : 'Freeze Card'}
              </button>
            </div>

            {/* Reveal Numbers */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  {showFullCard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Digital Card Numbers</h4>
                  <p className="text-[11px] text-slate-500">
                    Reveal 16-digit card number, CVV code, and expiration for online shopping.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullCard(!showFullCard)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {showFullCard ? 'Hide' : 'Reveal'}
              </button>
            </div>

            {/* Travel Notice */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Travel Notification</h4>
                  <p className="text-[11px] text-slate-500">
                    {travelNoticeSet ? 'Notice active: Tokyo, Japan (Nov 10 – Nov 24)' : 'Prevent false decline flags while traveling internationally.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTravelNoticeSet(!travelNoticeSet);
                  triggerToast(travelNoticeSet ? 'Travel notice removed.' : 'Travel notice set for upcoming trip.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  travelNoticeSet
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {travelNoticeSet ? 'Manage Notice' : 'Add Notice'}
              </button>
            </div>

            {/* Digital Wallet */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Apple Pay / Google Wallet</h4>
                  <p className="text-[11px] text-slate-500">
                    Card is linked to your digital wallet on iPhone 16 Pro.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Added
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
