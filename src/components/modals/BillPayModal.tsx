import React, { useState } from 'react';
import { X, Receipt, CheckCircle2, AlertCircle, Building2, Calendar } from 'lucide-react';
import { BankAccount, Payee } from '../../types/bank';
import { INITIAL_PAYEES } from '../../data/mockBankData';

interface BillPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onExecuteBillPay: (accountId: string, payeeName: string, amount: number, memo: string) => void;
}

export const BillPayModal: React.FC<BillPayModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onExecuteBillPay,
}) => {
  const eligibleAccounts = accounts.filter(a => a.type !== 'credit');
  const [selectedAccountId, setSelectedAccountId] = useState(eligibleAccounts[0]?.id || '');
  const [selectedPayeeId, setSelectedPayeeId] = useState(INITIAL_PAYEES[0].id);
  const [amountStr, setAmountStr] = useState('142.50');
  const [deliveryDate, setDeliveryDate] = useState('2026-10-25');
  const [memo, setMemo] = useState('Monthly billing cycle');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentAccount = accounts.find(a => a.id === selectedAccountId);
  const currentPayee = INITIAL_PAYEES.find(p => p.id === selectedPayeeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bill amount.');
      return;
    }

    if (!currentAccount || amount > currentAccount.balance) {
      setError('Insufficient funds in the selected account.');
      return;
    }

    if (!currentPayee) {
      setError('Please select a biller / payee.');
      return;
    }

    onExecuteBillPay(selectedAccountId, currentPayee.name, amount, memo);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0A3A6B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base sm:text-lg">Pay Bills Online</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close bill pay modal"
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
            <h4 className="text-xl font-bold text-slate-900 mb-1">Payment Scheduled!</h4>
            <p className="text-sm text-slate-600 mb-4">
              Your payment of <span className="font-bold text-slate-900 font-mono">${parseFloat(amountStr).toFixed(2)}</span> to <span className="font-semibold text-slate-800">{currentPayee?.name}</span> is confirmed.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 mb-6 text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Confirmation #:</span>
                <span className="font-bold text-slate-900">BP-{Math.floor(300000 + Math.random() * 700000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deliver By:</span>
                <span className="text-slate-900 font-sans">{deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Funding Source:</span>
                <span className="text-slate-900 font-sans">{currentAccount?.name} (···{currentAccount?.lastFour})</span>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Payee / Company
              </label>
              <select
                value={selectedPayeeId}
                onChange={(e) => setSelectedPayeeId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                {INITIAL_PAYEES.map((payee) => (
                  <option key={payee.id} value={payee.id}>
                    {payee.name} — {payee.category} (Acc: ···{payee.accountNumber.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Pay From */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pay From
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                {eligibleAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (···{acc.lastFour}) — Balance: ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount ($ USD)
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
                  Send On Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Memo
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Account number or invoice reference"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
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
                className="bg-[#0A4D8C] hover:bg-[#083E72] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Schedule Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
