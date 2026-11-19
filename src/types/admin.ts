export interface AdminSettings {
  transfersFrozen: boolean;
  dailyTransferLimit: number;
  approvalThreshold: number; // Transfers above this require admin approval
  autoFraudFilter: boolean;
  allowInternationalWires: boolean;
  ledgerBalanceNote: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'alert';
}

export interface PendingTransferItem {
  id: string;
  txId: string;
  fromAccountId: string;
  fromAccountName: string;
  toRecipient: string;
  amount: number;
  date: string;
  timestamp: string;
  memo: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Fraud Hold';
  riskScore: 'Low' | 'Medium' | 'High';
  flagReason?: string;
}
