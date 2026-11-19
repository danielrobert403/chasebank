import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Printer, Download, Tag, Edit3, ShieldCheck } from 'lucide-react';
import { Transaction, BankAccount } from '../../types/bank';
import { MerchantIcon } from '../MerchantIcon';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  account?: BankAccount;
  onUpdateMemo?: (id: string, newMemo: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  account,
  onUpdateMemo,
}) => {
  if (!isOpen || !transaction) return null;

  const [memo, setMemo] = useState(transaction.memo || '');
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [disputeRequested, setDisputeRequested] = useState(false);

  const isDeposit = transaction.amount > 0;

  const handleSaveMemo = () => {
    if (onUpdateMemo) {
      onUpdateMemo(transaction.id, memo);
    }
    setIsEditingMemo(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0A3A6B] text-white px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-sm">Transaction Details</span>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close transaction details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Top Header: Logo, Description & Amount */}
          <div className="flex flex-col items-center text-center">
            <MerchantIcon type={transaction.merchantLogoKey} className="w-14 h-14 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">{transaction.description}</h3>
            <p className="text-xs text-slate-500">{transaction.subtext}</p>
            
            <div className="mt-3">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans tabular-nums ${
                  isDeposit ? 'text-emerald-600' : 'text-slate-900'
                }`}
              >
                {isDeposit ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> {transaction.status}
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold text-slate-800">{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account:</span>
              <span className="font-semibold text-slate-800">
                {account ? `${account.name} (···${account.lastFour})` : 'Dream Total Checking (···3421)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reference #:</span>
              <span className="font-mono text-slate-700">{transaction.referenceNumber}</span>
            </div>
          </div>

          {/* Notes / Memo */}
          <div className="p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Personal Note / Memo
              </span>
              {!isEditingMemo && (
                <button
                  onClick={() => setIsEditingMemo(true)}
                  className="text-blue-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            {isEditingMemo ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingMemo(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMemo}
                    className="px-3 py-1 bg-blue-700 text-white rounded-md font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 italic">
                {memo || 'No notes added for this transaction.'}
              </p>
            )}
          </div>

          {/* Dispute alert or action */}
          {disputeRequested ? (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dispute Case Filed (#DIS-9402)</p>
                <p className="text-[11px] mt-0.5 text-amber-700">
                  Our fraud resolution specialist is investigating this charge. A provisional credit has been requested.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setDisputeRequested(true)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Dispute this charge
              </button>
              <button
                onClick={() => window.print()}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print receipt
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
