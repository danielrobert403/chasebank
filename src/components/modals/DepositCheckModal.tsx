import React, { useState } from 'react';
import { X, Camera, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw, Upload } from 'lucide-react';
import { BankAccount } from '../../types/bank';

interface DepositCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onExecuteDeposit: (accountId: string, amount: number, memo: string) => void;
}

export const DepositCheckModal: React.FC<DepositCheckModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onExecuteDeposit,
}) => {
  const eligibleAccounts = accounts.filter(a => a.type !== 'credit');
  const [selectedAccountId, setSelectedAccountId] = useState(eligibleAccounts[0]?.id || '');
  const [amountStr, setAmountStr] = useState('500.00');
  const [hasFrontPhoto, setHasFrontPhoto] = useState(true);
  const [hasBackPhoto, setHasBackPhoto] = useState(true);
  const [isEndorsed, setIsEndorsed] = useState(true);
  const [payerName, setPayerName] = useState('TechVentures LLC');
  const [checkNumber, setCheckNumber] = useState('4829');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }

    if (!isEndorsed) {
      setError('Please certify that the check is signed and endorsed.');
      return;
    }

    setIsProcessing(true);
    setError('');

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onExecuteDeposit(
        selectedAccountId,
        amount,
        `Mobile Check Deposit #${checkNumber} from ${payerName}`
      );
    }, 1200);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#0A3A6B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base sm:text-lg">Deposit Checks</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close deposit modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">Check Accepted for Deposit!</h4>
            <p className="text-sm text-slate-600 mb-4">
              We received your check for <span className="font-bold text-slate-900 font-mono">${parseFloat(amountStr).toFixed(2)}</span>. Funds have been posted to your account.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-6 text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Confirmation:</span>
                <span className="font-bold text-slate-900">DEP-{Math.floor(200000 + Math.random() * 800000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="text-slate-900 font-sans">
                  {eligibleAccounts.find(a => a.id === selectedAccountId)?.name} (···{eligibleAccounts.find(a => a.id === selectedAccountId)?.lastFour})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Availability:</span>
                <span className="text-emerald-700 font-sans font-semibold">Immediate availability</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-[#0A4D8C] hover:bg-[#083E72] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer text-sm shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Deposit To Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                {eligibleAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (···{acc.lastFour}) — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Check Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="text"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-base font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payer Name / Business
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Check Image Previews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Check Photos (Front & Back)
                </span>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High quality scan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Photo */}
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-3 flex flex-col justify-between h-32 relative group">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Front of Check</span>
                    <span className="text-emerald-700 font-semibold font-mono">#{checkNumber}</span>
                  </div>
                  {/* Mock Check Graphic */}
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded p-2 text-[10px] space-y-1 shadow-2xs font-mono">
                    <div className="flex justify-between text-slate-700">
                      <span>{payerName}</span>
                      <span className="font-bold">${amountStr}</span>
                    </div>
                    <div className="text-[9px] text-slate-500">PAY TO THE ORDER OF: Paulina Villarreal</div>
                    <div className="text-[8px] text-slate-400 border-t border-emerald-200/60 pt-0.5">
                      ⑆021000021⑆ 891048298765⑈ {checkNumber}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">Auto-captured · Ready</div>
                </div>

                {/* Back Photo */}
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-3 flex flex-col justify-between h-32 relative">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Back of Check</span>
                    <span className="text-blue-700 font-semibold">Endorsed</span>
                  </div>
                  <div className="bg-slate-100 border border-slate-300/80 rounded p-2 text-[10px] flex items-center justify-between shadow-2xs">
                    <div className="space-y-0.5 text-slate-600">
                      <p className="italic font-serif text-slate-800">Paulina Villarreal</p>
                      <p className="text-[9px] text-slate-500">For Mobile Deposit Only</p>
                      <p className="text-[8px] text-slate-400">At My Dream Bank</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">Endorsement verified</div>
                </div>
              </div>
            </div>

            {/* Endorsement Certification Checkbox */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="endorseCheck"
                checked={isEndorsed}
                onChange={(e) => setIsEndorsed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="endorseCheck" className="cursor-pointer leading-relaxed text-[11px]">
                I certify that the check is endorsed on the back with my signature and marked <strong>&ldquo;For mobile deposit at My Dream Bank only&rdquo;</strong>, and that I will retain the physical check in a secure location for 14 days.
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-[#0A4D8C] hover:bg-[#083E72] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
                {isProcessing ? 'Processing Check...' : 'Deposit Check'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
