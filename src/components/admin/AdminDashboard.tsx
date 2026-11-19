import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  ArrowRight,
  ArrowLeftRight,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Sliders,
  FileText,
  Clock,
  History,
  TrendingDown,
  Building2,
  User,
} from 'lucide-react';
import { BankAccount, Transaction } from '../../types/bank';
import { AdminSettings, AuditLogItem, PendingTransferItem } from '../../types/admin';

interface AdminDashboardProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: Partial<AdminSettings>) => void;
  onApproveTransfer: (transferId: string) => void;
  onRejectTransfer: (transferId: string, reason: string) => void;
  onHoldTransfer: (transferId: string) => void;
  onAdjustLedgerBalance: (accountId: string, amount: number, memo: string) => void;
  pendingTransfers: PendingTransferItem[];
  auditLogs: AuditLogItem[];
  onExitAdmin: () => void;
  onLogoutAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  accounts,
  transactions,
  adminSettings,
  onUpdateAdminSettings,
  onApproveTransfer,
  onRejectTransfer,
  onHoldTransfer,
  onAdjustLedgerBalance,
  pendingTransfers,
  auditLogs,
  onExitAdmin,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'controls' | 'history' | 'audit'>('queue');
  const [adjustAmountStr, setAdjustAmountStr] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustMemo, setAdjustMemo] = useState('Administrative Treasury Adjustment');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Main checking account (...3421)
  const mainAccount = accounts.find(a => a.type === 'checking') || accounts[0];

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(adjustAmountStr);
    if (isNaN(amount) || amount <= 0) return;

    const finalAmount = adjustType === 'credit' ? amount : -amount;
    onAdjustLedgerBalance(mainAccount.id, finalAmount, adjustMemo);
    setAdjustSuccessMsg(`Successfully executed ledger ${adjustType.toUpperCase()} of $${amount.toFixed(2)}.`);
    setAdjustAmountStr('');
    setTimeout(() => setAdjustSuccessMsg(''), 3500);
  };

  const pendingCount = pendingTransfers.filter(t => t.status === 'Pending Review' || t.status === 'Fraud Hold').length;
  const pendingTotal = pendingTransfers
    .filter(t => t.status === 'Pending Review' || t.status === 'Fraud Hold')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans select-none">
      
      {/* Top Operations Header - Matching Customer Top Bar (#0B3968) */}
      <header className="bg-[#0B3968] text-white px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs border-b border-[#082E55]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold font-mono text-sm">
            OPS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Treasury & Transfer Operations Console
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 font-semibold">
                SYSTEM LIVE
              </span>
            </div>
            <p className="text-[11px] text-blue-200 font-mono">
              Controlling Main Account: <span className="text-white font-semibold">{mainAccount.name} (···{mainAccount.lastFour})</span> · Operator: <span className="text-sky-300">OP-8492 (Lead Controller)</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onExitAdmin}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Switch to customer dashboard view"
          >
            <span>Customer View</span>
          </button>
          <button
            onClick={onLogoutAdmin}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            title="Sign out of Admin Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container in Crisp Light Palette */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 space-y-6 flex-1">
        
        {/* KPI Strip in Clean Light Card Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Main Account Balance */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Main Account Balance</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums tracking-tight font-sans">
                ${mainAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Status:</span>
              <span className={`font-semibold ${adminSettings.transfersFrozen ? 'text-rose-600' : 'text-emerald-600'}`}>
                {adminSettings.transfersFrozen ? 'Outbound Transfers Frozen' : 'Transfers Enabled'}
              </span>
            </div>
          </div>

          {/* Pending Queue Count */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Transfers Awaiting Clearance</span>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums tracking-tight font-sans">
                {pendingCount}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                (${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} queue value)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Approval Threshold:</span>
              <span className="font-semibold text-slate-800">${adminSettings.approvalThreshold.toFixed(2)}</span>
            </div>
          </div>

          {/* Daily Transfer Limit */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Daily Cumulative Cap</span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#1170C3] tabular-nums tracking-tight font-sans">
                ${adminSettings.dailyTransferLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Multi-Device Sync:</span>
              <span className="font-semibold text-emerald-600">Connected (Live)</span>
            </div>
          </div>

          {/* Emergency Kill Switch Status */}
          <div className={`rounded-xl p-5 border shadow-xs flex flex-col justify-between transition-colors ${
            adminSettings.transfersFrozen
              ? 'bg-rose-50/70 border-rose-300 text-rose-900'
              : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
          }`}>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">Outbound Kill Switch</span>
            <div className="my-2 flex items-center justify-between">
              <span className="text-base font-bold">
                {adminSettings.transfersFrozen ? 'TRANSFERS LOCKED' : 'NORMAL OPERATION'}
              </span>
              <button
                onClick={() => onUpdateAdminSettings({ transfersFrozen: !adminSettings.transfersFrozen })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  adminSettings.transfersFrozen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {adminSettings.transfersFrozen ? 'Unlock Transfers' : 'Lock Transfers'}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 leading-tight">
              {adminSettings.transfersFrozen ? 'Outbound customer transfers will be rejected.' : 'Customer transfers permitted under compliance policy.'}
            </span>
          </div>

        </div>

        {/* Tab Navigation in Clean Segmented Style */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-[#1170C3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Transfer Approval Queue ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'controls'
                ? 'bg-[#1170C3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Transfer Limits & Balance Adjustment</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#1170C3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Main Account Ledger Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-[#1170C3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Operator Audit Log ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: PENDING TRANSFERS APPROVAL QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transfers Requiring Administrative Clearance</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live queue of transactions on the main checking account needing supervisor release.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                  Realtime Sync Active
                </span>
              </div>

              {pendingTransfers.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {pendingTransfers.map((item) => (
                    <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 text-sm">{item.toRecipient}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                            item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            item.status === 'Fraud Hold' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {item.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.riskScore === 'High' ? 'text-rose-700 bg-rose-50' :
                            item.riskScore === 'Medium' ? 'text-amber-700 bg-amber-50' :
                            'text-slate-600 bg-slate-100'
                          }`}>
                            Risk: {item.riskScore}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                          <span>From: <strong className="text-slate-800">{item.fromAccountName}</strong></span>
                          <span>·</span>
                          <span>Memo: <span className="text-slate-700">{item.memo}</span></span>
                          <span>·</span>
                          <span>Time: <span className="font-mono text-slate-700 font-semibold">{item.timestamp}</span></span>
                          {item.flagReason && (
                            <>
                              <span>·</span>
                              <span className="text-amber-700 font-medium">Trigger: {item.flagReason}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Decision Buttons */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums font-mono block">
                            ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-400">Outbound Transfer</span>
                        </div>

                        {item.status === 'Pending Review' || item.status === 'Fraud Hold' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onApproveTransfer(item.id)}
                              className="px-3.5 py-1.5 bg-[#0E8345] hover:bg-[#0B6E39] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => onHoldTransfer(item.id)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Hold
                            </button>
                            <button
                              onClick={() => onRejectTransfer(item.id, 'Flagged by Treasury Risk Policy')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600 font-mono px-3 py-1 bg-slate-100 rounded-lg">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                  <p className="font-semibold text-slate-800">Approval Queue is Clear</p>
                  <p className="text-slate-500 mt-1">All transfers on the main account have been verified and processed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIMITS & BALANCE ADJUSTMENT */}
        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Transfer Policy & Guardrails */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-5 shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Main Account Transfer Rules</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure limits, compliance triggers, and auto-approval thresholds.
                </p>
              </div>

              {/* Threshold Slider */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Auto-Approval Threshold</span>
                  <span className="font-mono font-bold text-[#1170C3]">${adminSettings.approvalThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={adminSettings.approvalThreshold}
                  onChange={(e) => onUpdateAdminSettings({ approvalThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-[#1170C3] cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Any customer transfer exceeding <strong>${adminSettings.approvalThreshold.toFixed(2)}</strong> will be paused and routed directly to this admin console for verification.
                </p>
              </div>

              {/* Daily Limit */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">24-Hour Cumulative Transfer Cap</span>
                  <span className="font-mono font-bold text-[#1170C3]">${adminSettings.dailyTransferLimit.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  {[2500, 5000, 10000, 25000, 50000].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => onUpdateAdminSettings({ dailyTransferLimit: cap })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        adminSettings.dailyTransferLimit === cap
                          ? 'bg-[#1170C3] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ${(cap / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900 block">Auto Fraud Risk Scoring</span>
                    <span className="text-[11px] text-slate-500">Flag new external accounts and rapid sequential wires</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminSettings.autoFraudFilter}
                    onChange={(e) => onUpdateAdminSettings({ autoFraudFilter: e.target.checked })}
                    className="w-4 h-4 accent-[#1170C3] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900 block">Allow Cross-Border SWIFT Transfers</span>
                    <span className="text-[11px] text-slate-500">Permit foreign currency and international bank wires</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminSettings.allowInternationalWires}
                    onChange={(e) => onUpdateAdminSettings({ allowInternationalWires: e.target.checked })}
                    className="w-4 h-4 accent-[#1170C3] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Manual Ledger Balance Adjustment Form */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Manual Ledger Adjustment</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Inject funds or execute debit corrections on the main checking account.
                </p>

                {adjustSuccessMsg && (
                  <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adjustSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleExecuteAdjustment} className="space-y-4 mt-4">
                  {/* Credit or Debit Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('credit')}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        adjustType === 'credit'
                          ? 'bg-[#0E8345] text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      + Credit Account (Add Funds)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('debit')}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        adjustType === 'debit'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      - Debit Account (Deduct Funds)
                    </button>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                      Adjustment Amount ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={adjustAmountStr}
                        onChange={(e) => setAdjustAmountStr(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3.5 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1170C3]"
                        required
                      />
                    </div>
                  </div>

                  {/* Reason / Memo */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                      Compliance Audit Reason / Reference
                    </label>
                    <input
                      type="text"
                      value={adjustMemo}
                      onChange={(e) => setAdjustMemo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1170C3]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1170C3] hover:bg-[#0D5CA0] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Post Ledger Adjustment
                  </button>
                </form>
              </div>

              <div className="text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100 mt-6">
                All ledger corrections are permanent and recorded under Operator ID OP-8492.
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MAIN ACCOUNT LEDGER HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Main Account Live Transaction Stream</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete ledger for {mainAccount.name} (···{mainAccount.lastFour}) with real-time timestamps
                </p>
              </div>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {transactions
                .filter(t => !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 block">{t.description}</span>
                      <span className="text-[11px] text-slate-500">
                        {t.date} · {t.subtext} · Ref: <span className="font-mono">{t.referenceNumber}</span>
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`text-sm font-bold ${t.amount > 0 ? 'text-[#0E8345]' : 'text-slate-900'}`}>
                        {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-sans font-medium">{t.status}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security & Administrative Audit Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable record of all supervisor actions, limit updates, and transfer releases.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1170C3]">{log.operator}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-800">{log.action}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
