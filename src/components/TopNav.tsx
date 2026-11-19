import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, CheckCircle2, Shield, ArrowRight, X, Menu, Sliders } from 'lucide-react';
import { BankLogo } from './BankLogo';
import { AlertNotification, Transaction, BankAccount } from '../types/bank';

interface TopNavProps {
  alerts: AlertNotification[];
  onMarkAlertRead: (id: string) => void;
  onClearAllAlerts: () => void;
  accounts: BankAccount[];
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onOpenTransfer: () => void;
  onOpenDeposit: () => void;
  onOpenStatements: () => void;
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brandTheme: 'dream' | 'chase';
  setBrandTheme?: (theme: 'dream' | 'chase') => void;
  onOpenAdminLogin?: () => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  alerts,
  onMarkAlertRead,
  onClearAllAlerts,
  accounts,
  transactions,
  onSelectTransaction,
  onOpenTransfer,
  onOpenDeposit,
  onOpenStatements,
  onToggleSidebar,
  setActiveTab,
  brandTheme,
  onOpenAdminLogin,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(a => !a.read).length;

  const filteredTransactions = searchQuery.trim()
    ? transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subtext.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredAccounts = searchQuery.trim()
    ? accounts.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lastFour.includes(searchQuery)
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0B3968] text-white shadow-sm border-b border-[#082E55]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('accounts')}
            className="text-left focus:outline-hidden hover:opacity-95 transition-opacity cursor-pointer"
          >
            <BankLogo brandName={brandTheme === 'chase' ? 'CHASE' : 'MY DREAM BANK'} />
          </button>
        </div>

        {/* Center: Search input matching screenshot */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search transactions, accounts, help and more..."
              className="w-full bg-[#082B4F] border border-blue-300/25 text-white placeholder-blue-200/75 text-xs sm:text-[13px] rounded-full pl-10 pr-9 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-300 focus:bg-[#062444] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (searchQuery.trim().length > 0) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in duration-100">
              {filteredAccounts.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                    Accounts
                  </div>
                  {filteredAccounts.map(acc => (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setActiveTab('accounts');
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between px-2 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{acc.name}</span>
                        <span className="text-xs text-slate-500 font-mono">···{acc.lastFour}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-900">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {filteredTransactions.length > 0 ? (
                <div className="p-3">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                    Matching Transactions
                  </div>
                  {filteredTransactions.map(tx => (
                    <div
                      key={tx.id}
                      onClick={() => {
                        onSelectTransaction(tx);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between px-2 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-medium text-slate-900">{tx.description}</div>
                        <div className="text-[11px] text-slate-500">{tx.date} · {tx.category}</div>
                      </div>
                      <div className={`text-xs font-mono font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filteredAccounts.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No results found for &ldquo;{searchQuery}&rdquo;.
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Right side icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Notifications Bell with unread dot */}
          <div ref={alertsRef} className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-hidden cursor-pointer"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0B3968]" />
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-100">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearAllAlerts}
                      className="text-xs text-[#1170C3] hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => onMarkAlertRead(alert.id)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !alert.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-1">
                          {!alert.read ? (
                            <span className="block w-2 h-2 rounded-full bg-[#1170C3]" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{alert.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            {alert.description}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            {alert.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile: Hello, Paulina */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-hidden cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center text-white text-[11px] font-semibold bg-white/15">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[13px] font-medium tracking-tight hidden sm:inline-block">
                Hello, Paulina
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 p-2 text-xs divide-y divide-slate-100 animate-in fade-in duration-100">
                <div className="px-3 py-2">
                  <p className="font-bold text-slate-900 text-sm">Paulina Villarreal</p>
                  <p className="text-slate-500 text-[11px]">Primary Account Holder</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('account-services'); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700 font-medium cursor-pointer"
                  >
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => { setActiveTab('security'); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700 font-medium cursor-pointer"
                  >
                    Security & Privacy
                  </button>
                  <button
                    onClick={() => { onOpenStatements(); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700 font-medium cursor-pointer"
                  >
                    Statements & Documents
                  </button>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
