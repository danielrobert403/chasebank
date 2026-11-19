import React from 'react';
import {
  FileText,
  DollarSign,
  ArrowLeftRight,
  Camera,
  CreditCard,
  Receipt,
  ChevronRight,
} from 'lucide-react';

interface QuickActionsProps {
  onPayBills: () => void;
  onSendMoney: () => void;
  onTransfer: () => void;
  onDepositChecks: () => void;
  onManageCards: () => void;
  onStatements: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onPayBills,
  onSendMoney,
  onTransfer,
  onDepositChecks,
  onManageCards,
  onStatements,
}) => {
  const actions = [
    {
      id: 'pay-bills',
      label: 'Pay bills',
      icon: Receipt,
      onClick: onPayBills,
    },
    {
      id: 'send-money',
      label: 'Send money',
      icon: DollarSign,
      onClick: onSendMoney,
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: ArrowLeftRight,
      onClick: onTransfer,
    },
    {
      id: 'deposit-checks',
      label: 'Deposit checks',
      icon: Camera,
      onClick: onDepositChecks,
    },
    {
      id: 'manage-cards',
      label: 'Manage cards',
      icon: CreditCard,
      onClick: onManageCards,
    },
    {
      id: 'statements',
      label: 'Statements',
      icon: FileText,
      onClick: onStatements,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-bold text-slate-900">
          Quick actions
        </h3>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 3x2 Grid matching screenshot */}
      <div className="grid grid-cols-3 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full border border-blue-200/80 bg-blue-50/50 text-[#1170C3] flex items-center justify-center transition-colors mb-1.5">
                <Icon className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 group-hover:text-[#1170C3] transition-colors leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
