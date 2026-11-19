import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { BankAccount, Transaction } from '../../types/bank';
import { AdminSettings, PendingTransferItem } from '../../types/admin';
import { TransferToBankFlow, InterBankTransferPayload } from '../TransferToBankFlow';

export type { InterBankTransferPayload };

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  transactions?: Transaction[];
  pendingTransfers?: PendingTransferItem[];
  defaultFromAccount?: BankAccount | null;
  adminSettings?: AdminSettings;
  onExecuteTransfer: (fromId: string, toId: string, amount: number, memo: string) => { requiresApproval: boolean };
  onExecuteInterBankTransfer?: (payload: InterBankTransferPayload) => { requiresApproval: boolean };
  initialTab?: 'interbank' | 'internal';
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions = [],
  pendingTransfers = [],
  defaultFromAccount,
  adminSettings,
  onExecuteTransfer,
  onExecuteInterBankTransfer,
  initialTab = 'interbank',
}) => {
  const [activeTab, setActiveTab] = useState<'interbank' | 'internal'>(initialTab);

  // Internal Transfer Form State
  const [fromAccountId, setFromAccountId] = useState(defaultFromAccount?.id || accounts[0]?.id || '');
  const [internalToAccountId, setInternalToAccountId] = useState(
    accounts.find((a) => a.id !== (defaultFromAccount?.id || accounts[0]?.id))?.id || ''
  );
  const [internalAmountStr, setInternalAmountStr] = useState('');
  const [internalMemo, setInternalMemo] = useState('');

  const [error, setError] = useState('');
  const [isInternalSuccess, setIsInternalSuccess] = useState(false);
  const [internalSuccessData, setInternalSuccessData] = useState<{
    amount: number;
    fromAccountName: string;
    recipientName: string;
    requiresApproval: boolean;
    confirmationNumber: string;
  } | null>(null);

  useEffect(() => {
    if (defaultFromAccount) {
      setFromAccountId(defaultFromAccount.id);
    } else if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id);
    }
  }, [defaultFromAccount, accounts]);

  useEffect(() => {
    setActiveTab(initialTab);
    setError('');
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const currentFromAcc = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const internalToAcc = accounts.find((a) => a.id === internalToAccountId);

  const availableBalance =
    currentFromAcc?.type === 'credit'
      ? (currentFromAcc.availableCredit || 0)
      : (currentFromAcc?.balance || 0);

  const handleInternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(internalAmountStr);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid transfer amount greater than $0.00');
      return;
    }

    if (!currentFromAcc) {
      setError('Please select a source account.');
      return;
    }

    if (!internalToAcc) {
      setError('Please select a destination account.');
      return;
    }

    if (fromAccountId === internalToAccountId) {
      setError('Source and destination accounts must be different.');
      return;
    }

    if (amount > availableBalance) {
      setError(`Amount exceeds available balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`);
      return;
    }

    const res = onExecuteTransfer(fromAccountId, internalToAccountId, amount, internalMemo || 'Internal Account Transfer');
    setInternalSuccessData({
      amount,
      fromAccountName: currentFromAcc.name,
      recipientName: internalToAcc.name,
      requiresApproval: res?.requiresApproval || false,
      confirmationNumber: `MDB-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setIsInternalSuccess(true);
  };

  const handleCloseModal = () => {
    setIsInternalSuccess(false);
    setInternalSuccessData(null);
    setInternalAmountStr('');
    setInternalMemo('');
    setError('');
    onClose();
  };

  const fallbackInterBank = (payload: InterBankTransferPayload) => {
    if (onExecuteInterBankTransfer) {
      return onExecuteInterBankTransfer(payload);
    }
    return onExecuteTransfer(payload.fromId, 'external', payload.amount, `${payload.transferSpeed}: ${payload.beneficiaryName}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#F4F6F9] w-full max-w-[460px] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Top Switcher Bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-2">
          <div className="flex bg-[#EEF1F6] p-1 rounded-full">
            <button
              type="button"
              onClick={() => {
                setActiveTab('interbank');
                setError('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'interbank'
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('internal');
                setError('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'internal'
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Internal Transfer
            </button>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close transfer modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {activeTab === 'interbank' ? (
          <TransferToBankFlow
            accounts={accounts}
            transactions={transactions}
            pendingTransfers={pendingTransfers}
            defaultFromAccount={defaultFromAccount}
            adminSettings={adminSettings}
            onExecuteInterBankTransfer={fallbackInterBank}
            onCancel={handleCloseModal}
          />
        ) : isInternalSuccess && internalSuccessData ? (
          <div className="p-6 text-center">
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/70 shadow-xs">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-100 text-amber-600">
                <Clock className="w-7 h-7" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-1">
                Transfer Initiated
              </h4>

              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Your transfer of ${internalSuccessData.amount.toFixed(2)} from {internalSuccessData.fromAccountName} to {internalSuccessData.recipientName} is currently pending.
              </p>

              <div className="p-3 bg-[#F6F8FB] rounded-xl border border-slate-200/70 text-xs text-slate-600 space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span>Confirmation #</span>
                  <span className="font-mono font-semibold text-slate-900">{internalSuccessData.confirmationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-amber-600">Pending</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full mt-4 rounded-full bg-[#0F172A] hover:bg-[#0B3968] text-white font-semibold py-3.5 text-sm cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInternalSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/60 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                  From Account
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full bg-[#EEF1F6] rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-hidden focus:bg-white focus:ring-2 focus:ring-[#0B3968] cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (··{acc.lastFour}) — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                  To Account
                </label>
                <select
                  value={internalToAccountId}
                  onChange={(e) => setInternalToAccountId(e.target.value)}
                  className="w-full bg-[#EEF1F6] rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-hidden focus:bg-white focus:ring-2 focus:ring-[#0B3968] cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (··{acc.lastFour}) {acc.type === 'credit' ? `(Balance: $${acc.balance.toFixed(2)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[13px] font-semibold text-slate-800">
                    Amount ($ USD)
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="0.00"
                  value={internalAmountStr}
                  onChange={(e) => {
                    if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                      setInternalAmountStr(e.target.value);
                      setError('');
                    }
                  }}
                  className="w-full bg-[#EEF1F6] rounded-xl px-4 py-3 text-base font-bold font-mono text-slate-900 outline-hidden focus:bg-white focus:ring-2 focus:ring-[#0B3968]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly savings"
                  value={internalMemo}
                  onChange={(e) => setInternalMemo(e.target.value)}
                  className="w-full bg-[#EEF1F6] rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-hidden focus:bg-white focus:ring-2 focus:ring-[#0B3968]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-[#0F172A] hover:bg-[#0B3968] py-3.5 text-sm font-semibold text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
