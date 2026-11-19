import React, { useState } from 'react';
import { Settings, CreditCard, Download, FileText, CheckCircle2, Copy, Shield, ExternalLink } from 'lucide-react';
import { BankAccount } from '../../types/bank';

interface AccountServicesViewProps {
  accounts: BankAccount[];
  onManageCards: () => void;
  onOpenStatements: () => void;
}

export const AccountServicesView: React.FC<AccountServicesViewProps> = ({
  accounts,
  onManageCards,
  onOpenStatements,
}) => {
  const [copiedRouting, setCopiedRouting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const checking = accounts.find(a => a.type === 'checking') || accounts[0];

  const copyToClipboard = (text: string, type: 'routing' | 'account') => {
    navigator.clipboard.writeText(text);
    if (type === 'routing') {
      setCopiedRouting(true);
      setTimeout(() => setCopiedRouting(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Services</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account features, direct deposit forms, order checks, and card preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Deposit Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Direct Deposit & Wiring Info</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Use these details to set up payroll direct deposit with your employer or receive incoming domestic wire transfers.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Routing Transit Number (ABA)</span>
                  <span className="font-bold text-slate-900">{checking.routingNumber}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(checking.routingNumber, 'routing')}
                  className="px-2.5 py-1 text-[11px] font-sans font-semibold text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {copiedRouting ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Checking Account Number</span>
                  <span className="font-bold text-slate-900">{checking.fullAccountNumber}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(checking.fullAccountNumber, 'account')}
                  className="px-2.5 py-1 text-[11px] font-sans font-semibold text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {copiedAccount ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Bank Name & Address</span>
                <span className="font-bold text-slate-900 font-sans">My Dream Bank, N.A. · Baton Rouge, LA</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => alert('Downloaded official pre-filled Direct Deposit authorization PDF.')}
              className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Pre-filled Direct Deposit Form (PDF)
            </button>
          </div>
        </div>

        {/* Card & Checkbook Tools */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Card & Payment Controls</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Instantly lock lost cards, request replacement plastics, or configure overdraft protection.
            </p>

            <div className="space-y-2.5 text-xs">
              <div
                onClick={onManageCards}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Manage Debit & Credit Cards</h4>
                  <p className="text-[11px] text-slate-500">Lock cards, reveal numbers, and set travel alerts</p>
                </div>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={onOpenStatements}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Statements & Tax Forms (1099-INT)</h4>
                  <p className="text-[11px] text-slate-500">View or download past 7 years of statements</p>
                </div>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => alert('Order confirmed: A box of 100 personal checks will arrive within 5 business days.')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">Order Personal Checks</h4>
                  <p className="text-[11px] text-slate-500">Standard Dream Monogram checkbooks</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overdraft Protection:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
              Linked to Dream Savings (···8765)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
