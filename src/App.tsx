import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { AccountCard } from './components/AccountCard';
import { RecentTransactions } from './components/RecentTransactions';
import { PromoBanner } from './components/PromoBanner';
import { SpendingWidget } from './components/SpendingWidget';
import { QuickActions } from './components/QuickActions';
import { MessagesWidget } from './components/MessagesWidget';
import { LoginScreen } from './components/LoginScreen';

// Views
import { PayTransferView } from './components/views/PayTransferView';
import { DepositChecksView } from './components/views/DepositChecksView';
import { AccountServicesView } from './components/views/AccountServicesView';
import { SecurityView } from './components/views/SecurityView';
import { CustomerServiceView } from './components/views/CustomerServiceView';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals
import { TransferModal, InterBankTransferPayload } from './components/modals/TransferModal';
import { DepositCheckModal } from './components/modals/DepositCheckModal';
import { BillPayModal } from './components/modals/BillPayModal';
import { ManageCardsModal } from './components/modals/ManageCardsModal';
import { StatementsModal } from './components/modals/StatementsModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { AllTransactionsModal } from './components/modals/AllTransactionsModal';
import { OfferModal } from './components/modals/OfferModal';

// Initial Data & Types
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_PENDING_TRANSFERS,
  INITIAL_AUDIT_LOGS,
} from './data/mockBankData';
import { BankAccount, Transaction, AlertNotification } from './types/bank';
import { AdminSettings, AuditLogItem, PendingTransferItem } from './types/admin';

export default function App() {
  // Authentication Role: Always starts at login screen when opening the link
  const [loggedInRole, setLoggedInRole] = useState<'user' | 'admin' | null>(null);

  useEffect(() => {
    localStorage.removeItem('mdb_auth_role');
  }, []);

  const [activeTab, setActiveTab] = useState<string>('accounts');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);
  const brandTheme = 'chase' as const;

  // Authoritative State (Synchronized across all devices)
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(INITIAL_ADMIN_SETTINGS);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransferItem[]>(INITIAL_PENDING_TRANSFERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Filtered account state on recent transactions
  const [filteredAccountId, setFilteredAccountId] = useState<string | null>(null);

  // Modals Visibility
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isBillPayModalOpen, setIsBillPayModalOpen] = useState(false);
  const [isManageCardsModalOpen, setIsManageCardsModalOpen] = useState(false);
  const [isStatementsModalOpen, setIsStatementsModalOpen] = useState(false);
  const [isAllTransactionsModalOpen, setIsAllTransactionsModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Selected item states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transferFromAccount, setTransferFromAccount] = useState<BankAccount | null>(null);
  const [transferModalTab, setTransferModalTab] = useState<'interbank' | 'internal'>('interbank');

  // Sync state received from server
  const applyServerState = useCallback((data: {
    accounts?: BankAccount[];
    transactions?: Transaction[];
    alerts?: AlertNotification[];
    adminSettings?: AdminSettings;
    pendingTransfers?: PendingTransferItem[];
    auditLogs?: AuditLogItem[];
  }) => {
    if (data.accounts) setAccounts(data.accounts);
    if (data.transactions) setTransactions(data.transactions);
    if (data.alerts) setAlerts(data.alerts);
    if (data.adminSettings) setAdminSettings(data.adminSettings);
    if (data.pendingTransfers) setPendingTransfers(data.pendingTransfers);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
  }, []);

  // REALTIME CROSS-DEVICE SYNC: Connect to Server-Sent Events (SSE) and polling fallback
  useEffect(() => {
    // 1. Initial State Fetch
    fetch('/api/bank/state')
      .then(res => res.json())
      .then(data => applyServerState(data))
      .catch(() => {
        // Fallback to local memory if offline
      });

    // 2. Server-Sent Events (SSE) for instant cross-device broadcast
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/bank/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          applyServerState(parsed);
        } catch {
          // ignore parse error
        }
      };
    } catch {
      // EventSource not supported or failed
    }

    // 3. Periodic polling fallback every 2.5 seconds to guarantee multi-device updates on any mobile network
    const interval = setInterval(() => {
      fetch('/api/bank/state')
        .then(res => res.json())
        .then(data => applyServerState(data))
        .catch(() => {});
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [applyServerState]);

  // Handle Login from the exact Chase login form
  const handleLogin = (role: 'user' | 'admin', _user: string) => {
    setLoggedInRole(role);
    setActiveTab('accounts');
  };

  const handleLogout = () => {
    setLoggedInRole(null);
    setActiveTab('accounts');
    localStorage.removeItem('mdb_auth_role');
  };

  // Live Cross-Device Transfers
  const handleExecuteTransfer = (fromId: string, toId: string, amount: number, memo: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const requiresAdminApproval = (fromAcc?.type === 'checking') && (amount > adminSettings.approvalThreshold);

    fetch('/api/bank/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId, toId, amount, memo }),
    })
      .then(res => res.json())
      .then(data => {
        // Server broadcasts to all clients via SSE
      })
      .catch(err => {
        console.error('Transfer failed', err);
      });

    return { requiresApproval: requiresAdminApproval };
  };

  // Live Cross-Device Inter-Bank & FedWire Transfers
  const handleExecuteInterBankTransfer = (payload: InterBankTransferPayload) => {
    const requiresAdminApproval = payload.amount > adminSettings.approvalThreshold;

    fetch('/api/bank/inter-bank-transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(() => {})
      .catch(err => {
        console.error('Inter-bank transfer failed', err);
      });

    return { requiresApproval: requiresAdminApproval };
  };

  // Live Cross-Device Mobile Check Deposit
  const handleExecuteDeposit = (accountId: string, amount: number, memo: string) => {
    fetch('/api/bank/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, amount, memo }),
    }).catch(err => console.error(err));
  };

  // Live Cross-Device Bill Pay
  const handleExecuteBillPay = (accountId: string, payeeName: string, amount: number, memo: string) => {
    fetch('/api/bank/bill-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, payeeName, amount, memo }),
    }).catch(err => console.error(err));
  };

  // Live Card Freeze Toggle
  const handleToggleCardFreeze = (accountId: string) => {
    fetch('/api/bank/toggle-freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    }).catch(err => console.error(err));
  };

  // Live Admin Actions
  const handleApproveTransfer = (transferId: string) => {
    fetch('/api/bank/admin-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId }),
    }).catch(err => console.error(err));
  };

  const handleRejectTransfer = (transferId: string, reason: string) => {
    fetch('/api/bank/admin-reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, reason }),
    }).catch(err => console.error(err));
  };

  const handleHoldTransfer = (transferId: string) => {
    fetch('/api/bank/admin-hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId }),
    }).catch(err => console.error(err));
  };

  const handleAdjustLedgerBalance = (accountId: string, amount: number, memo: string) => {
    fetch('/api/bank/admin-adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, amount, memo }),
    }).catch(err => console.error(err));
  };

  const handleUpdateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    fetch('/api/bank/admin-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    }).catch(err => console.error(err));
  };

  const handleMarkAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
  };

  const handleClearAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleUpdateMemo = (txId: string, newMemo: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, memo: newMemo } : t))
    );
    if (selectedTransaction && selectedTransaction.id === txId) {
      setSelectedTransaction(prev => prev ? { ...prev, memo: newMemo } : null);
    }
  };

  const handlePayTransferClick = (account: BankAccount) => {
    setTransferFromAccount(account);
    setIsTransferModalOpen(true);
  };

  // 1. IF NOT LOGGED IN: Render the Exact Chase Login Screen from user's attached image
  if (!loggedInRole) {
    return <LoginScreen onLogin={handleLogin} brandTheme={brandTheme} />;
  }

  // 2. IF LOGGED IN AS ADMIN: Render Admin Dashboard with EXACT LIGHT COLOR SCHEME
  if (loggedInRole === 'admin') {
    return (
      <AdminDashboard
        accounts={accounts}
        transactions={transactions}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
        onApproveTransfer={handleApproveTransfer}
        onRejectTransfer={handleRejectTransfer}
        onHoldTransfer={handleHoldTransfer}
        onAdjustLedgerBalance={handleAdjustLedgerBalance}
        pendingTransfers={pendingTransfers}
        auditLogs={auditLogs}
        onExitAdmin={() => setLoggedInRole('user')}
        onLogoutAdmin={handleLogout}
      />
    );
  }

  // 3. IF LOGGED IN AS NORMAL USER: Render Customer Banking Portal
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <TopNav
        alerts={alerts}
        onMarkAlertRead={handleMarkAlertRead}
        onClearAllAlerts={handleClearAllAlerts}
        accounts={accounts}
        transactions={transactions}
        onSelectTransaction={setSelectedTransaction}
        onOpenTransfer={() => {
          setTransferFromAccount(accounts[0]);
          setIsTransferModalOpen(true);
        }}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onOpenStatements={() => setIsStatementsModalOpen(true)}
        onToggleSidebar={() => setSidebarMobileOpen(!sidebarMobileOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brandTheme={brandTheme}
        onOpenAdminLogin={() => setLoggedInRole('admin')}
        onLogout={handleLogout}
      />

      {/* Main Body Layout: Left Sidebar + Center Viewport */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={sidebarMobileOpen}
          onCloseMobile={() => setSidebarMobileOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0">
          
          {/* TAB 1: ACCOUNTS (EXACT MATCH OF SCREENSHOT) */}
          {activeTab === 'accounts' && (
            <div className="space-y-5">
              
              {/* Snapshot Header Row matching screenshot */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-1">
                <div>
                  <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight font-sans">
                    Good evening, Paulina
                  </h1>
                  <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                    Here&apos;s a snapshot of your accounts.
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-400 block text-[11px]">Last signed in</span>
                  <span className="font-semibold text-slate-700">Nov 06, 2026 at 7:42 PM ET</span>
                </div>
              </div>

              {/* 3 Account Cards (Checking, Savings, Freedom Credit Card) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {accounts.map(acc => (
                  <AccountCard
                    key={acc.id}
                    account={acc}
                    brandTheme={brandTheme}
                    onPayTransfer={handlePayTransferClick}
                    onViewDetails={(a) => {
                      if (a.type === 'credit') {
                        setIsManageCardsModalOpen(true);
                      } else {
                        setFilteredAccountId(a.id);
                      }
                    }}
                    onToggleLock={handleToggleCardFreeze}
                    isSelected={filteredAccountId === acc.id}
                  />
                ))}
              </div>

              {/* Lower Section 2-Column Split matching screenshot */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left Column (Transactions with Realtime Timestamps + Promo Banner) ~ 8 cols */}
                <div className="lg:col-span-8 space-y-4">
                  <RecentTransactions
                    transactions={transactions}
                    onSelectTransaction={setSelectedTransaction}
                    onSeeAllTransactions={() => setIsAllTransactionsModalOpen(true)}
                    selectedAccountId={filteredAccountId}
                    onClearAccountFilter={() => setFilteredAccountId(null)}
                  />

                  {/* Cash back promo card */}
                  <PromoBanner
                    brandTheme={brandTheme}
                    onLearnMore={() => setIsOfferModalOpen(true)}
                  />
                </div>

                {/* Right Column (Spending + Quick Actions + Messages) ~ 4 cols */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Spending this month */}
                  <SpendingWidget
                    transactions={transactions}
                    onViewAllSpending={() => setIsAllTransactionsModalOpen(true)}
                  />

                  {/* Quick Actions */}
                  <QuickActions
                    onPayBills={() => setIsBillPayModalOpen(true)}
                    onSendMoney={() => {
                      setActiveTab('pay-transfer');
                    }}
                    onTransfer={() => {
                      setTransferFromAccount(accounts[0]);
                      setIsTransferModalOpen(true);
                    }}
                    onDepositChecks={() => setIsDepositModalOpen(true)}
                    onManageCards={() => setIsManageCardsModalOpen(true)}
                    onStatements={() => setIsStatementsModalOpen(true)}
                  />

                  {/* Messages & Alerts */}
                  <MessagesWidget
                    alerts={alerts}
                    onSelectAlert={(alt) => {
                      handleMarkAlertRead(alt.id);
                      if (alt.type === 'statement') {
                        setIsStatementsModalOpen(true);
                      } else if (alt.type === 'offer') {
                        setIsOfferModalOpen(true);
                      }
                    }}
                    onViewAllMessages={() => setActiveTab('security')}
                  />
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PAY & TRANSFER */}
          {activeTab === 'pay-transfer' && (
            <PayTransferView
              accounts={accounts}
              transactions={transactions}
              pendingTransfers={pendingTransfers}
              adminSettings={adminSettings}
              onExecuteInterBankTransfer={handleExecuteInterBankTransfer}
              onOpenInternalTransferModal={() => {
                setTransferFromAccount(accounts[0]);
                setTransferModalTab('internal');
                setIsTransferModalOpen(true);
              }}
              onOpenBillPayModal={() => setIsBillPayModalOpen(true)}
              onBackToAccounts={() => setActiveTab('accounts')}
            />
          )}

          {/* TAB 3: DEPOSIT CHECKS */}
          {activeTab === 'deposit-checks' && (
            <DepositChecksView
              accounts={accounts}
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
            />
          )}

          {/* TAB 4: ACCOUNT SERVICES */}
          {activeTab === 'account-services' && (
            <AccountServicesView
              accounts={accounts}
              onManageCards={() => setIsManageCardsModalOpen(true)}
              onOpenStatements={() => setIsStatementsModalOpen(true)}
            />
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <SecurityView />
          )}

          {/* TAB 6: CUSTOMER SERVICE */}
          {activeTab === 'customer-service' && (
            <CustomerServiceView />
          )}

        </main>
      </div>

      {/* Footer with Sign Out and Cross-Device status */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] w-full mx-auto">
        <p className="text-[11px] text-slate-400">
          © 2026 {brandTheme === 'chase' ? 'JPMorgan Chase Bank, N.A.' : 'My Dream Bank, N.A.'} Member FDIC. Equal Housing Lender.
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Multi-Device Cloud Sync Active
          </span>
          <span>·</span>
          <button
            onClick={handleLogout}
            className="hover:underline text-rose-600 font-medium cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </footer>

      {/* Customer Modals */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferModalTab('interbank');
        }}
        accounts={accounts}
        transactions={transactions}
        pendingTransfers={pendingTransfers}
        defaultFromAccount={transferFromAccount}
        adminSettings={adminSettings}
        onExecuteTransfer={handleExecuteTransfer}
        onExecuteInterBankTransfer={handleExecuteInterBankTransfer}
        initialTab={transferModalTab}
      />

      <DepositCheckModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        accounts={accounts}
        onExecuteDeposit={handleExecuteDeposit}
      />

      <BillPayModal
        isOpen={isBillPayModalOpen}
        onClose={() => setIsBillPayModalOpen(false)}
        accounts={accounts}
        onExecuteBillPay={handleExecuteBillPay}
      />

      <ManageCardsModal
        isOpen={isManageCardsModalOpen}
        onClose={() => setIsManageCardsModalOpen(false)}
        accounts={accounts}
        onToggleCardFreeze={handleToggleCardFreeze}
      />

      <StatementsModal
        isOpen={isStatementsModalOpen}
        onClose={() => setIsStatementsModalOpen(false)}
        accounts={accounts}
      />

      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        account={accounts.find(a => a.id === selectedTransaction?.accountId)}
        onUpdateMemo={handleUpdateMemo}
      />

      <AllTransactionsModal
        isOpen={isAllTransactionsModalOpen}
        onClose={() => setIsAllTransactionsModalOpen(false)}
        transactions={transactions}
        accounts={accounts}
        onSelectTransaction={setSelectedTransaction}
      />

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />

    </div>
  );
}
