import React from 'react';
import { ArrowLeftRight, Send, Clock, ShieldCheck } from 'lucide-react';
import { BankAccount, Transaction } from '../../types/bank';
import { AdminSettings, PendingTransferItem } from '../../types/admin';
import { TransferToBankFlow, InterBankTransferPayload } from '../TransferToBankFlow';

interface PayTransferViewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  pendingTransfers: PendingTransferItem[];
  adminSettings: AdminSettings;
  onExecuteInterBankTransfer: (payload: InterBankTransferPayload) => { requiresApproval: boolean };
  onOpenInternalTransferModal: () => void;
  onOpenBillPayModal: () => void;
  onBackToAccounts: () => void;
}

export const PayTransferView: React.FC<PayTransferViewProps> = ({
  accounts,
  transactions,
  pendingTransfers,
  adminSettings,
  onExecuteInterBankTransfer,
  onOpenInternalTransferModal,
  onOpenBillPayModal,
  onBackToAccounts,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pay &amp; Transfer</h1>
            <p className="text-xs text-slate-500 mt-1">
              Transfer funds to external bank accounts via ACH, FedNow, or Domestic FedWire, move funds between your accounts, or pay bills.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenInternalTransferModal}
              className="px-4 py-2 bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Internal Transfer</span>
            </button>
            <button
              onClick={onOpenBillPayModal}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4 text-blue-700" />
              <span>Pay Bills</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: 4-Step Transfer to Bank Account + Available Funding Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Center: 4-Step Transfer to Bank Account UI matching screenshot */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[460px] rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden bg-[#F4F6F9]">
            <TransferToBankFlow
              accounts={accounts}
              transactions={transactions}
              pendingTransfers={pendingTransfers}
              defaultFromAccount={accounts[0]}
              adminSettings={adminSettings}
              onExecuteInterBankTransfer={onExecuteInterBankTransfer}
              onCancel={onBackToAccounts}
            />
          </div>
        </div>

        {/* Right: Account Balances Summary & Transfer Policies (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3">Available Funding Balances</h3>
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{acc.name}</p>
                      <p className="text-[11px] font-mono text-slate-500">···· {acc.lastFour}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm font-mono text-slate-900">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {acc.type === 'credit' ? 'Current Balance' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Standard cutoff time for same-day FedWire &amp; ACH is 8:00 PM ET.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Daily transfer limit: ${adminSettings.dailyTransferLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Supervisor clearance above ${adminSettings.approvalThreshold.toLocaleString('en-US', { minimumFractionDigits: 2 })}.
              </span>
            </div>
            <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Supported Wire Rails:</span>
              <div className="flex gap-1.5 font-mono text-[10px]">
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-bold">FedWire</span>
                <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">FedNow</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">Standard ACH</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
