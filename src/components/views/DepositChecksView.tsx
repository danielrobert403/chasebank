import React from 'react';
import { Camera, CheckCircle2, ShieldAlert, ArrowRight, FileCheck, Clock } from 'lucide-react';
import { BankAccount } from '../../types/bank';

interface DepositChecksViewProps {
  accounts: BankAccount[];
  onOpenDepositModal: () => void;
}

export const DepositChecksView: React.FC<DepositChecksViewProps> = ({
  accounts,
  onOpenDepositModal,
}) => {
  const depositHistory = [
    { id: 'dep-1', date: 'Oct 19, 2026', payer: 'ACME Corp', checkNumber: '1042', amount: 2450.00, status: 'Funds Cleared' },
    { id: 'dep-2', date: 'Oct 02, 2026', payer: 'State Tax Refund', checkNumber: '8821', amount: 512.30, status: 'Funds Cleared' },
    { id: 'dep-3', date: 'Sep 18, 2026', payer: 'Freelance Design Client', checkNumber: '2904', amount: 1200.00, status: 'Funds Cleared' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Deposit Checks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deposit paper checks quickly and securely using your device camera or mobile scan.
          </p>
        </div>
        <button
          onClick={onOpenDepositModal}
          className="px-5 py-2.5 bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <Camera className="w-4 h-4" />
          <span>Deposit a Check Now</span>
        </button>
      </div>

      {/* Guidelines & Limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">How to Endorse</h3>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Sign the back of the check and write &ldquo;For mobile deposit at My Dream Bank only&rdquo; directly under your signature.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Availability</h3>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Deposits submitted before 9:00 PM ET on business days are typically available the next morning.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Your Limits</h3>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Daily limit: <strong className="text-slate-800">$10,000.00</strong> · 30-day rolling limit: <strong className="text-slate-800">$50,000.00</strong>.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Past Mobile Deposits</h2>
        <div className="divide-y divide-slate-100">
          {depositHistory.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{item.payer}</p>
                <p className="text-[11px] text-slate-500">Check #{item.checkNumber} · Deposited {item.date}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-600 font-mono text-sm block">
                  +${item.amount.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
