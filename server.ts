import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_PENDING_TRANSFERS,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockBankData';
import { BankAccount, Transaction, AlertNotification } from './src/types/bank';
import { AdminSettings, AuditLogItem, PendingTransferItem } from './src/types/admin';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Authoritative Cross-Device Bank State
let accounts: BankAccount[] = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));
let transactions: Transaction[] = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
let alerts: AlertNotification[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let adminSettings: AdminSettings = JSON.parse(JSON.stringify(INITIAL_ADMIN_SETTINGS));
let pendingTransfers: PendingTransferItem[] = JSON.parse(JSON.stringify(INITIAL_PENDING_TRANSFERS));
let auditLogs: AuditLogItem[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

// Connected Realtime SSE Clients
const sseClients = new Set<Response>();

function getRealtimeDateString(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getRealtimeTimeString(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
}

function broadcastState() {
  const payload = JSON.stringify({
    accounts,
    transactions,
    alerts,
    adminSettings,
    pendingTransfers,
    auditLogs,
  });

  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}

// 1. SSE Real-time Endpoint
app.get('/api/bank/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const initialPayload = JSON.stringify({
    accounts,
    transactions,
    alerts,
    adminSettings,
    pendingTransfers,
    auditLogs,
  });
  res.write(`data: ${initialPayload}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 2. Fetch Full State
app.get('/api/bank/state', (_req: Request, res: Response) => {
  res.json({
    accounts,
    transactions,
    alerts,
    adminSettings,
    pendingTransfers,
    auditLogs,
  });
});

// 3. Customer Fund Transfer (Internal)
app.post('/api/bank/transfer', (req: Request, res: Response) => {
  const { fromId, toId, amount, memo } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer amount' });
  }

  const fromAcc = accounts.find(a => a.id === fromId);
  const toAcc = accounts.find(a => a.id === toId);

  if (!fromAcc || !toAcc) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const available = fromAcc.type === 'credit' ? (fromAcc.availableCredit || 0) : fromAcc.balance;
  if (numAmount > available) {
    return res.status(400).json({ error: `Transfer amount ($${numAmount.toFixed(2)}) exceeds available balance ($${available.toFixed(2)})` });
  }

  const nowTs = Date.now();
  const txId = `tx-${nowTs}`;

  // Hold / deduct funds from source account immediately
  accounts = accounts.map(acc => {
    if (acc.id === fromId) {
      if (acc.type === 'credit') {
        return { ...acc, balance: acc.balance + numAmount, availableCredit: (acc.availableCredit || 0) - numAmount };
      }
      return { ...acc, balance: acc.balance - numAmount, availableBalance: (acc.availableBalance || 0) - numAmount };
    }
    return acc;
  });

  // Record immediately in Transaction History as Pending
  const newTx: Transaction = {
    id: txId,
    accountId: fromId,
    date: getRealtimeDateString(),
    isoDate: new Date().toISOString(),
    description: `Transfer to ${toAcc.name}`,
    subtext: `Internal Transfer · ${memo || 'Processing'}`,
    category: 'Other',
    amount: -numAmount,
    status: 'Pending',
    merchantLogoKey: 'transfer',
    referenceNumber: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
    memo: memo || '',
  };

  transactions = [newTx, ...transactions];

  // Queue for Admin Approve / Decline
  const pendingItem: PendingTransferItem = {
    id: `ptx-${nowTs}`,
    txId,
    fromAccountId: fromId,
    fromAccountName: `${fromAcc.name} (···${fromAcc.lastFour})`,
    toRecipient: `${toAcc.name} (···${toAcc.lastFour})`,
    toAccountId: toId,
    fundsHeld: true,
    amount: numAmount,
    date: getRealtimeDateString(),
    timestamp: getRealtimeTimeString(),
    memo: memo || 'Internal Account Transfer',
    status: 'Pending Review',
    riskScore: numAmount > 10000 ? 'High' : numAmount > 1000 ? 'Medium' : 'Low',
    flagReason: 'Awaiting standard transfer settlement',
  };

  pendingTransfers = [pendingItem, ...pendingTransfers];

  auditLogs = [
    {
      id: `log-${nowTs}`,
      timestamp: getRealtimeTimeString(),
      operator: 'TRANSFER_GATEWAY',
      action: 'TRANSFER_QUEUED_PENDING',
      details: `Internal transfer of $${numAmount.toFixed(2)} to ${toAcc.name} recorded as Pending for admin decision.`,
      severity: 'info',
    },
    ...auditLogs,
  ];

  broadcastState();
  res.json({ requiresApproval: false, pending: true, transaction: newTx, pendingItem });
});

// 3.5. Inter-Bank & FedWire / FedNow / ACH Transfer
app.post('/api/bank/inter-bank-transfer', (req: Request, res: Response) => {
  const {
    fromId,
    receivingBank,
    routingNumber,
    beneficiaryName,
    accountNumber,
    transferSpeed,
    amount,
    memo,
  } = req.body;

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer amount' });
  }

  const fromAcc = accounts.find(a => a.id === fromId);
  if (!fromAcc) {
    return res.status(404).json({ error: 'Source account not found' });
  }

  const available = fromAcc.type === 'credit' ? (fromAcc.availableCredit || 0) : fromAcc.balance;
  if (numAmount > available) {
    return res.status(400).json({ error: `Transfer amount ($${numAmount.toFixed(2)}) exceeds available balance ($${available.toFixed(2)})` });
  }

  const speedLabel = (transferSpeed as string) || 'FedWire';
  const cleanBank = (receivingBank as string)?.trim() || 'External Financial Institution';
  const cleanBeneficiary = (beneficiaryName as string)?.trim() || 'External Payee';
  const cleanAcct = (accountNumber as string)?.trim() || '••••';
  const lastFourAcct = cleanAcct.slice(-4);
  const nowTs = Date.now();
  const txId = `tx-${nowTs}`;

  // Hold / deduct funds from source account immediately
  accounts = accounts.map(acc => {
    if (acc.id === fromId) {
      if (acc.type === 'credit') {
        return { ...acc, balance: acc.balance + numAmount, availableCredit: (acc.availableCredit || 0) - numAmount };
      }
      return { ...acc, balance: acc.balance - numAmount, availableBalance: (acc.availableBalance || 0) - numAmount };
    }
    return acc;
  });

  // Immediately record in Transaction History as Pending
  const newTx: Transaction = {
    id: txId,
    accountId: fromId,
    date: getRealtimeDateString(),
    isoDate: new Date().toISOString(),
    description: `${cleanBeneficiary} (${cleanBank})`,
    subtext: `${speedLabel} Transfer · Acct ····${lastFourAcct}`,
    category: 'Other',
    amount: -numAmount,
    status: 'Pending',
    merchantLogoKey: 'transfer',
    referenceNumber: `WIRE-${Math.floor(100000000 + Math.random() * 900000000)}`,
    memo: memo || `${speedLabel} Transfer`,
  };

  transactions = [newTx, ...transactions];

  // Queue in Admin Dashboard for Approve / Decline
  const pendingItem: PendingTransferItem = {
    id: `ptx-${nowTs}`,
    txId,
    fromAccountId: fromId,
    fromAccountName: `${fromAcc.name} (···${fromAcc.lastFour})`,
    toRecipient: `${cleanBeneficiary} · ${cleanBank} (···${lastFourAcct})`,
    fundsHeld: true,
    amount: numAmount,
    date: getRealtimeDateString(),
    timestamp: getRealtimeTimeString(),
    memo: `${speedLabel}: ${memo || 'Inter-Bank Transfer'} (ABA: ${routingNumber || 'N/A'})`,
    status: 'Pending Review',
    riskScore: numAmount > 10000 ? 'High' : numAmount > 1000 ? 'Medium' : 'Low',
    flagReason: `${speedLabel} outbound transfer awaiting settlement decision`,
  };

  pendingTransfers = [pendingItem, ...pendingTransfers];

  auditLogs = [
    {
      id: `log-${nowTs}`,
      timestamp: getRealtimeTimeString(),
      operator: 'TRANSFER_GATEWAY',
      action: 'INTERBANK_TRANSFER_PENDING',
      details: `${speedLabel} to ${cleanBeneficiary} at ${cleanBank} ($${numAmount.toFixed(2)}) queued as Pending for admin approval or decline.`,
      severity: 'info',
    },
    ...auditLogs,
  ];

  broadcastState();
  res.json({ requiresApproval: false, pending: true, transaction: newTx, pendingItem });
});

// 4. Mobile Check Deposit
app.post('/api/bank/deposit', (req: Request, res: Response) => {
  const { accountId, amount, memo } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  accounts = accounts.map(acc => {
    if (acc.id === accountId) {
      return {
        ...acc,
        balance: acc.balance + numAmount,
        availableBalance: (acc.availableBalance || 0) + numAmount,
      };
    }
    return acc;
  });

  const targetAcc = accounts.find(a => a.id === accountId);
  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    accountId,
    date: getRealtimeDateString(),
    isoDate: new Date().toISOString(),
    description: 'Mobile Check Deposit',
    subtext: memo || 'Check Verified',
    category: 'Income',
    amount: numAmount,
    status: 'Posted',
    merchantLogoKey: 'deposit',
    referenceNumber: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
    memo: memo || '',
  };

  transactions = [newTx, ...transactions];

  alerts = [
    {
      id: `alt-${Date.now()}`,
      title: 'Mobile check deposit cleared',
      date: 'Today',
      timestamp: getRealtimeTimeString(),
      read: false,
      type: 'deposit',
      description: `Check deposit of $${numAmount.toFixed(2)} has cleared into ${targetAcc?.name}.`,
    },
    ...alerts,
  ];

  broadcastState();
  res.json({ success: true, transaction: newTx });
});

// 5. Bill Pay
app.post('/api/bank/bill-pay', (req: Request, res: Response) => {
  const { accountId, payeeName, amount, memo } = req.body;
  const numAmount = parseFloat(amount);

  accounts = accounts.map(acc => {
    if (acc.id === accountId) {
      return {
        ...acc,
        balance: acc.balance - numAmount,
        availableBalance: (acc.availableBalance || 0) - numAmount,
      };
    }
    return acc;
  });

  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    accountId,
    date: getRealtimeDateString(),
    isoDate: new Date().toISOString(),
    description: payeeName,
    subtext: `Electronic Bill Pay · ${memo || 'Completed'}`,
    category: 'Bills & Utilities',
    amount: -numAmount,
    status: 'Posted',
    merchantLogoKey: 'generic',
    referenceNumber: `BP-${Math.floor(100000 + Math.random() * 900000)}`,
    memo: memo || '',
  };

  transactions = [newTx, ...transactions];
  broadcastState();
  res.json({ success: true, transaction: newTx });
});

// 6. Toggle Card/Account Freeze
app.post('/api/bank/toggle-freeze', (req: Request, res: Response) => {
  const { accountId } = req.body;
  accounts = accounts.map(acc => {
    if (acc.id === accountId) {
      const isLocked = !acc.isLocked;
      return {
        ...acc,
        isLocked,
        cardDetails: acc.cardDetails ? { ...acc.cardDetails, isFrozen: isLocked } : undefined,
      };
    }
    return acc;
  });

  broadcastState();
  res.json({ success: true });
});

// 7. Admin: Approve Pending Transfer
app.post('/api/bank/admin-approve', (req: Request, res: Response) => {
  const { transferId } = req.body;
  const item = pendingTransfers.find(t => t.id === transferId);

  if (!item) {
    return res.status(404).json({ error: 'Transfer not found in queue' });
  }

  if (item.status === 'Approved' || item.status === 'Rejected') {
    return res.json({ success: true });
  }

  // Update account balances (if funds were not already held on submit, deduct sender; if internal transfer, credit destination)
  accounts = accounts.map(acc => {
    if (acc.id === item.fromAccountId && !item.fundsHeld) {
      if (acc.type === 'credit') {
        return { ...acc, balance: acc.balance + item.amount, availableCredit: (acc.availableCredit || 0) - item.amount };
      }
      return {
        ...acc,
        balance: acc.balance - item.amount,
        availableBalance: (acc.availableBalance || 0) - item.amount,
      };
    }
    if (item.toAccountId && acc.id === item.toAccountId) {
      if (acc.type === 'credit') {
        return {
          ...acc,
          balance: Math.max(0, acc.balance - item.amount),
          availableCredit: (acc.availableCredit || 0) + item.amount,
        };
      }
      return {
        ...acc,
        balance: acc.balance + item.amount,
        availableBalance: (acc.availableBalance || 0) + item.amount,
      };
    }
    return acc;
  });

  pendingTransfers = pendingTransfers.map(t =>
    t.id === transferId ? { ...t, status: 'Approved' } : t
  );

  const existingTx = transactions.find(tx => tx.id === item.txId);
  let resultingTx: Transaction;

  if (existingTx) {
    resultingTx = {
      ...existingTx,
      status: 'Posted',
      subtext: existingTx.subtext.replace(' · Processing', ' · Completed'),
    };
    transactions = transactions.map(tx => (tx.id === item.txId ? resultingTx : tx));
  } else {
    resultingTx = {
      id: `tx-rel-${Date.now()}`,
      accountId: item.fromAccountId,
      date: getRealtimeDateString(),
      isoDate: new Date().toISOString(),
      description: `Transfer to ${item.toRecipient}`,
      subtext: item.memo || 'Bank Transfer · Completed',
      category: 'Other',
      amount: -item.amount,
      status: 'Posted',
      merchantLogoKey: 'transfer',
      referenceNumber: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
      memo: item.memo,
    };
    transactions = [resultingTx, ...transactions];
  }

  auditLogs = [
    {
      id: `log-${Date.now()}`,
      timestamp: getRealtimeTimeString(),
      operator: 'OP-8492 (Super Admin)',
      action: 'TRANSFER_APPROVED',
      details: `Approved & posted transfer of $${item.amount.toFixed(2)} to ${item.toRecipient}.`,
      severity: 'info',
    },
    ...auditLogs,
  ];

  alerts = [
    {
      id: `alt-${Date.now()}`,
      title: 'Transfer Completed',
      date: 'Today',
      timestamp: getRealtimeTimeString(),
      read: false,
      type: 'deposit',
      description: `Your transfer of $${item.amount.toFixed(2)} to ${item.toRecipient} has posted.`,
    },
    ...alerts,
  ];

  broadcastState();
  res.json({ success: true, transaction: resultingTx });
});

// 8. Admin: Decline Pending Transfer
app.post('/api/bank/admin-reject', (req: Request, res: Response) => {
  const { transferId, reason } = req.body;
  const item = pendingTransfers.find(t => t.id === transferId);

  if (!item) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  if (item.status === 'Approved' || item.status === 'Rejected') {
    return res.json({ success: true });
  }

  // Refund held funds back to source account
  if (item.fundsHeld) {
    accounts = accounts.map(acc => {
      if (acc.id === item.fromAccountId) {
        if (acc.type === 'credit') {
          return {
            ...acc,
            balance: Math.max(0, acc.balance - item.amount),
            availableCredit: (acc.availableCredit || 0) + item.amount,
          };
        }
        return {
          ...acc,
          balance: acc.balance + item.amount,
          availableBalance: (acc.availableBalance || 0) + item.amount,
        };
      }
      return acc;
    });
  }

  pendingTransfers = pendingTransfers.map(t =>
    t.id === transferId ? { ...t, status: 'Rejected', flagReason: reason || 'Declined' } : t
  );

  // Update matching Pending transaction in history to Declined
  transactions = transactions.map(tx =>
    tx.id === item.txId
      ? { ...tx, status: 'Declined', subtext: `${tx.subtext} · Declined` }
      : tx
  );

  auditLogs = [
    {
      id: `log-${Date.now()}`,
      timestamp: getRealtimeTimeString(),
      operator: 'OP-8492 (Super Admin)',
      action: 'TRANSFER_REJECTED',
      details: `Declined transfer of $${item.amount.toFixed(2)} to ${item.toRecipient} and refunded balance. Reason: ${reason || 'Declined'}.`,
      severity: 'alert',
    },
    ...auditLogs,
  ];

  alerts = [
    {
      id: `alt-${Date.now()}`,
      title: 'Transfer Declined',
      date: 'Today',
      timestamp: getRealtimeTimeString(),
      read: false,
      type: 'security',
      description: `Your transfer of $${item.amount.toFixed(2)} to ${item.toRecipient} was declined and the funds have been returned to your account.`,
    },
    ...alerts,
  ];

  broadcastState();
  res.json({ success: true });
});

// 9. Admin: Place Fraud Hold
app.post('/api/bank/admin-hold', (req: Request, res: Response) => {
  const { transferId } = req.body;

  pendingTransfers = pendingTransfers.map(t =>
    t.id === transferId ? { ...t, status: 'Fraud Hold' } : t
  );

  auditLogs = [
    {
      id: `log-${Date.now()}`,
      timestamp: getRealtimeTimeString(),
      operator: 'OP-8492 (Super Admin)',
      action: 'TRANSFER_HELD_FOR_VERIFICATION',
      details: `Placed security hold on transfer ${transferId}. Customer identity verification requested.`,
      severity: 'warning',
    },
    ...auditLogs,
  ];

  broadcastState();
  res.json({ success: true });
});

// 10. Admin: Ledger Adjustment (Credit or Debit)
app.post('/api/bank/admin-adjust', (req: Request, res: Response) => {
  const { accountId, amount, memo } = req.body;
  const numAmount = parseFloat(amount);

  accounts = accounts.map(acc => {
    if (acc.id === accountId) {
      return {
        ...acc,
        balance: acc.balance + numAmount,
        availableBalance: (acc.availableBalance || 0) + numAmount,
      };
    }
    return acc;
  });

  const newTx: Transaction = {
    id: `tx-adj-${Date.now()}`,
    accountId,
    date: getRealtimeDateString(),
    isoDate: new Date().toISOString(),
    description: numAmount > 0 ? 'Admin Ledger Credit' : 'Admin Ledger Debit',
    subtext: memo || 'Treasury Correction',
    category: numAmount > 0 ? 'Income' : 'Other',
    amount: numAmount,
    status: 'Posted',
    merchantLogoKey: 'deposit',
    referenceNumber: `ADJ-${Math.floor(100000 + Math.random() * 900000)}`,
    memo: memo || '',
  };

  transactions = [newTx, ...transactions];

  auditLogs = [
    {
      id: `log-${Date.now()}`,
      timestamp: getRealtimeTimeString(),
      operator: 'OP-8492 (Super Admin)',
      action: 'LEDGER_BALANCE_OVERRIDE',
      details: `Executed ${numAmount > 0 ? 'Credit' : 'Debit'} of $${Math.abs(numAmount).toFixed(2)} on account ${accountId}. Memo: ${memo}.`,
      severity: 'warning',
    },
    ...auditLogs,
  ];

  broadcastState();
  res.json({ success: true, transaction: newTx });
});

// 11. Admin: Update Policy Settings
app.post('/api/bank/admin-settings', (req: Request, res: Response) => {
  const newSettings = req.body;
  adminSettings = { ...adminSettings, ...newSettings };

  auditLogs = [
    {
      id: `log-${Date.now()}`,
      timestamp: getRealtimeTimeString(),
      operator: 'OP-8492 (Super Admin)',
      action: 'SETTINGS_MODIFIED',
      details: `Updated parameters: ${Object.keys(newSettings).join(', ')}.`,
      severity: 'info',
    },
    ...auditLogs,
  ];

  broadcastState();
  res.json({ success: true, adminSettings });
});

// Attach Vite SPA Middleware
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true, allowedHosts: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`My Dream Bank server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
