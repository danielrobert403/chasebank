import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Transaction } from '../types/bank';

interface SpendingWidgetProps {
  transactions?: Transaction[];
  onViewAllSpending?: () => void;
}

export const SpendingWidget: React.FC<SpendingWidgetProps> = ({
  transactions = [],
  onViewAllSpending,
}) => {
  const totalSpending = transactions
    .filter((tx) => tx.amount < 0 && tx.status !== 'Declined')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      {/* Header */}
      <div
        onClick={onViewAllSpending}
        className="flex items-center justify-between cursor-pointer group mb-2"
      >
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1170C3] transition-colors">
          Spending this month
        </h3>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1170C3] transition-colors" />
      </div>

      {/* Total Amount Only */}
      <div>
        <span className="text-[28px] font-bold text-slate-900 tabular-nums tracking-tight font-sans block leading-none">
          ${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};
