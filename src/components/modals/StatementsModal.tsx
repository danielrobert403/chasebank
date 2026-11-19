import React, { useState } from 'react';
import { X, FileText, Download, Printer, Shield, Calendar, CheckCircle2 } from 'lucide-react';
import { BankAccount } from '../../types/bank';

interface StatementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
}

export const StatementsModal: React.FC<StatementsModalProps> = ({
  isOpen,
  onClose,
  accounts,
}) => {
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState('October 2026');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAcc = accounts.find(a => a.id === selectedAccId) || accounts[0];

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#0A3A6B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base sm:text-lg">Account Statements & Tax Documents</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close statements modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedAccId}
              onChange={(e) => setSelectedAccId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (···{acc.lastFour})
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="October 2026">October 2026 (Current)</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Official statement downloaded for {selectedPeriod} ({currentAcc.name}).</span>
          </div>
        )}

        {/* Paper Statement Simulated View */}
        <div className="p-6">
          <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs font-sans text-xs space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h4 className="font-extrabold text-sm tracking-wider uppercase text-[#0A3A6B]">MY DREAM BANK, N.A.</h4>
                <p className="text-[11px] text-slate-500">P.O. Box 260151, Baton Rouge, LA 70826</p>
                <p className="text-[10px] text-slate-400">FDIC Certificate #3511 · Equal Housing Lender</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">ACCOUNT STATEMENT</span>
                <span className="text-[11px] text-slate-500 font-mono">Statement Period: {selectedPeriod}</span>
              </div>
            </div>

            {/* Customer & Account Info */}
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Account Holder</p>
                <p className="font-bold text-slate-900">MICHAEL R. MORGAN</p>
                <p className="text-slate-600">742 Evergreen Terrace</p>
                <p className="text-slate-600">Seattle, WA 98101</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Account Summary</p>
                <p className="font-bold text-slate-900">{currentAcc.officialName}</p>
                <p className="text-slate-600 font-mono">Account #: ••••••{currentAcc.lastFour}</p>
                <p className="text-slate-600 font-mono">Routing (ABA): {currentAcc.routingNumber}</p>
              </div>
            </div>

            {/* Balance Summary Box */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Beginning Balance ({selectedPeriod.split(' ')[0]} 1, 2026):</span>
                <span>${(currentAcc.balance * 0.85).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total Deposits and Additions:</span>
                <span>+$2,450.00</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Total Withdrawals and Subtractions:</span>
                <span>-$1,128.45</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
                <span>Ending Balance:</span>
                <span>${currentAcc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
              This statement is certified by My Dream Bank as an official financial record.
            </div>
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
