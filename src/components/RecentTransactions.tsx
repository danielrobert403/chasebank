import React from 'react';
import { Transaction } from '../types/bank';
import { MerchantIcon } from './MerchantIcon';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onSeeAllTransactions: () => void;
  selectedAccountId?: string | null;
  onClearAccountFilter?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onSelectTransaction,
  onSeeAllTransactions,
  selectedAccountId,
  onClearAccountFilter,
}) => {
  // Filter by selected account if any
  const filtered = selectedAccountId
    ? transactions.filter(t => t.accountId === selectedAccountId)
    : transactions;

  // Show the 5 iconic transactions from the screenshot
  const displayList = filtered.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
            Recent transactions
          </h2>
          {selectedAccountId && onClearAccountFilter && (
            <button
              onClick={onClearAccountFilter}
              className="text-xs text-[#1170C3] hover:underline"
            >
              (Show all accounts)
            </button>
          )}
        </div>

        <button
          onClick={onSeeAllTransactions}
          className="text-xs sm:text-[13px] font-semibold text-[#1170C3] hover:text-[#0D5CA0] hover:underline cursor-pointer"
        >
          See all transactions
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 py-3 border-b border-slate-100">
        <div className="col-span-3 sm:col-span-3">Date</div>
        <div className="col-span-6 sm:col-span-6">Description</div>
        <div className="col-span-3 sm:col-span-3 text-right">Amount</div>
      </div>

      {/* Transaction Rows matching screenshot */}
      <div className="divide-y divide-slate-100">
        {displayList.map((tx) => {
          const isDeposit = tx.amount > 0;
          return (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="grid grid-cols-12 items-center py-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-lg cursor-pointer transition-colors group"
            >
              {/* Date & Realtime Timestamp */}
              <div className="col-span-3 sm:col-span-3 text-[12px] sm:text-[13px] text-slate-700 font-medium pr-1">
                <span className="block leading-tight font-medium">{tx.date.includes(' · ') ? tx.date.split(' · ')[0] : tx.date}</span>
                {tx.date.includes(' · ') && (
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{tx.date.split(' · ')[1]}</span>
                )}
              </div>

              {/* Description + Brand Icon + Location */}
              <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                <MerchantIcon type={tx.merchantLogoKey} />
                <div className="truncate min-w-0">
                  <div className="text-[13px] sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#1170C3] transition-colors leading-tight">
                    {tx.description}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {tx.subtext}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="col-span-3 sm:col-span-3 text-right">
                <span
                  className={`text-[13px] sm:text-sm font-bold tabular-nums tracking-tight font-sans ${
                    tx.status === 'Declined'
                      ? 'text-slate-400 line-through'
                      : isDeposit
                        ? 'text-[#0E8345]'
                        : 'text-slate-900'
                  }`}
                >
                  {isDeposit ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {tx.status !== 'Posted' && (
                  <span
                    className={`block text-[10px] font-semibold mt-0.5 ${
                      tx.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
