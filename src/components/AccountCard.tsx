import React, { useState } from 'react';
import { ChevronRight, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { BankAccount } from '../types/bank';

interface AccountCardProps {
  account: BankAccount;
  brandTheme: 'dream' | 'chase';
  onPayTransfer: (account: BankAccount) => void;
  onViewDetails: (account: BankAccount) => void;
  onToggleLock?: (accountId: string) => void;
  isSelected?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  brandTheme,
  onPayTransfer,
  onViewDetails,
  onToggleLock,
  isSelected = false,
}) => {
  const [showNumbers, setShowNumbers] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Derive title based on brand theme
  const getAccountDisplayName = () => {
    if (brandTheme === 'chase') {
      if (account.type === 'checking') return 'Chase Total Checking';
      if (account.type === 'savings') return 'Chase Savings';
      return 'Chase Freedom';
    }
    return account.name;
  };

  // CARD 3: Credit Card matching screenshot
  if (account.type === 'credit') {
    return (
      <div
        className={`bg-white rounded-xl border border-slate-200/90 transition-all duration-150 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 ${
          isSelected ? 'ring-2 ring-[#1170C3]/30 border-[#1170C3]' : ''
        }`}
      >
        <div>
          {/* Credit Card Graphic - Deep Royal Blue */}
          <div
            onClick={() => onViewDetails(account)}
            className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#0C356A] via-[#0E4383] to-[#0A2F60] text-white p-4 shadow-xs cursor-pointer group select-none"
          >
            {/* Top row: CHASE ⬡ freedom */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-white font-sans">
                  {brandTheme === 'chase' ? 'CHASE' : 'DREAM'}
                </span>
                {/* Mini Octagon */}
                <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 fill-white" fill="white">
                  <polygon points="29,5 71,5 64,36 36,36" />
                  <polygon points="95,29 95,71 64,64 64,36" />
                  <polygon points="71,95 29,95 36,64 64,64" />
                  <polygon points="5,71 5,29 36,36 36,64" />
                </svg>
              </div>

              {/* freedom cursive script */}
              <span className="text-sm font-serif italic text-white tracking-tight font-medium">
                freedom
              </span>
            </div>

            {/* Dots + last 4 */}
            <div className="text-[11px] text-blue-200/90 font-mono tracking-wider mb-2">
              •••• {account.lastFour}
            </div>

            {/* Current Balance */}
            <div className="mt-2 flex items-end justify-between">
              <div>
                <span className="text-[22px] font-bold tracking-tight tabular-nums text-white block leading-tight font-sans">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-blue-200 block mt-0.5">
                  Current balance
                </span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-[15px] italic tracking-wider text-white font-serif">
                  VISA
                </span>
              </div>
            </div>
          </div>

          {/* Available Credit Row under card matching screenshot */}
          <div
            onClick={() => onViewDetails(account)}
            className="mt-4 pt-1 flex items-center justify-between cursor-pointer group"
          >
            <div>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                ${(account.availableCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-500 block">Available credit</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1170C3] transition-colors" />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => onPayTransfer(account)}
            className="bg-[#1170C3] hover:bg-[#0D5CA0] text-white text-[13px] font-semibold py-1.5 px-4 rounded-md transition-colors cursor-pointer"
          >
            Pay card
          </button>
          <button
            onClick={() => onViewDetails(account)}
            className="text-[13px] text-[#1170C3] hover:underline font-semibold cursor-pointer"
          >
            Manage card
          </button>
        </div>
      </div>
    );
  }

  // CARD 1 & 2: Checking and Savings Cards
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 transition-all duration-150 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 ${
        isSelected ? 'ring-2 ring-[#1170C3]/30 border-[#1170C3]' : ''
      }`}
    >
      <div>
        {/* Header: Name with Chevron Right & Last 4 */}
        <div
          onClick={() => onViewDetails(account)}
          className="flex items-start justify-between cursor-pointer group"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[15px] text-slate-900 group-hover:text-[#1170C3] transition-colors">
                {getAccountDisplayName()}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-sans tracking-wide">
              •••• {account.lastFour}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1170C3] transition-colors mt-0.5" />
        </div>

        {/* Balance Display */}
        <div className="mt-4">
          <div className="text-[26px] sm:text-[28px] font-bold text-slate-900 tracking-tight tabular-nums font-sans leading-none">
            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500">Available balance</span>
            {account.apr && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                {account.apr}
              </span>
            )}
          </div>
        </div>

        {/* Revealed details */}
        {showNumbers && (
          <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1 animate-in fade-in duration-100">
            <div className="flex justify-between">
              <span className="text-slate-400">Account:</span>
              <span className="font-semibold text-slate-900">{account.fullAccountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Routing (ABA):</span>
              <span className="font-semibold text-slate-900">{account.routingNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons matching screenshot: [Pay & transfer] and More */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 relative">
        <button
          onClick={() => onPayTransfer(account)}
          className="bg-[#1170C3] hover:bg-[#0D5CA0] text-white text-[13px] font-semibold py-1.5 px-4 rounded-md transition-colors shadow-none cursor-pointer whitespace-nowrap"
        >
          Pay & transfer
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="text-[13px] text-[#1170C3] hover:underline font-semibold cursor-pointer"
          >
            More
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-30 text-xs text-slate-700">
              <button
                onClick={() => {
                  setShowNumbers(!showNumbers);
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>{showNumbers ? 'Hide details' : 'Show account & routing'}</span>
                {showNumbers ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              <button
                onClick={() => {
                  onViewDetails(account);
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-100"
              >
                Statements & tax forms
              </button>
              {onToggleLock && (
                <button
                  onClick={() => {
                    onToggleLock(account.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between text-amber-700"
                >
                  <span>{account.isLocked ? 'Unlock account' : 'Lock card / account'}</span>
                  {account.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
