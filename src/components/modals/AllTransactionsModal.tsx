import React, { useState } from 'react';
import { X, Search, Download, Filter } from 'lucide-react';
import { Transaction, BankAccount } from '../../types/bank';
import { MerchantIcon } from '../MerchantIcon';

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: BankAccount[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const AllTransactionsModal: React.FC<AllTransactionsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  onSelectTransaction,
}) => {
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [exportNotice, setExportNotice] = useState(false);

  if (!isOpen) return null;

  const categories = ['all', 'Groceries', 'Restaurants', 'Shopping', 'Auto & transport', 'Income', 'Entertainment', 'Other'];

  const filtered = transactions.filter(t => {
    if (filterAccount !== 'all' && t.accountId !== filterAccount) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (search.trim() && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.subtext.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExportCSV = () => {
    // Generate simple CSV
    const csvRows = [
      ['Date', 'Description', 'Category', 'Amount', 'Status', 'Reference'],
      ...filtered.map(t => [t.date, `"${t.description}"`, t.category, t.amount.toString(), t.status, t.referenceNumber]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_dream_bank_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#0A3A6B] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg">All Account Transactions</h3>
            <p className="text-xs text-blue-200">Historical ledger with instant search and CSV export</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded-md"
            aria-label="Close all transactions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            {/* Account filter */}
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="all">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} (···{acc.lastFour})</option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportNotice ? 'Exporting...' : 'Export to CSV'}</span>
          </button>
        </div>

        {/* Transactions Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-12 text-[11px] font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200">
            <div className="col-span-3 sm:col-span-2">Date</div>
            <div className="col-span-6 sm:col-span-5">Description</div>
            <div className="hidden sm:block sm:col-span-2">Category</div>
            <div className="col-span-3 text-right">Amount</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map(tx => {
              const isDeposit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    onSelectTransaction(tx);
                    onClose();
                  }}
                  className="grid grid-cols-12 items-center py-3 hover:bg-blue-50/50 rounded-lg px-1 cursor-pointer transition-colors group"
                >
                  <div className="col-span-3 sm:col-span-2 text-xs text-slate-700 font-medium whitespace-nowrap">
                    {tx.date}
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 pr-2 min-w-0">
                    <MerchantIcon type={tx.merchantLogoKey} className="w-8 h-8" />
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {tx.subtext}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-2 text-xs text-slate-600">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                      {tx.category}
                    </span>
                  </div>

                  <div className="col-span-3 text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums tracking-tight font-sans ${
                        isDeposit ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                No transactions matched your selected filters.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Showing {filtered.length} of {transactions.length} total entries</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
