export type AccountType = 'checking' | 'savings' | 'credit';

export interface BankAccount {
  id: string;
  name: string;
  officialName: string;
  type: AccountType;
  lastFour: string;
  fullAccountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance?: number;
  availableCredit?: number;
  creditLimit?: number;
  apr?: string;
  isLocked?: boolean;
  cardDetails?: {
    cardholderName: string;
    expiryDate: string;
    cvv: string;
    isFrozen: boolean;
    autoPayEnabled: boolean;
    minimumPayment: number;
    paymentDueDate: string;
    lastStatementBalance: number;
    rewardsPoints: number;
  };
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  isoDate: string;
  description: string;
  subtext: string;
  category: 'Groceries' | 'Restaurants' | 'Shopping' | 'Auto & transport' | 'Bills & Utilities' | 'Income' | 'Entertainment' | 'Other';
  amount: number; // positive = credit/deposit, negative = debit/spend
  status: 'Posted' | 'Pending' | 'Declined';
  merchantLogoKey: 'starbucks' | 'amazon' | 'deposit' | 'shell' | 'netflix' | 'target' | 'apple' | 'uber' | 'grocery' | 'transfer' | 'spotify' | 'lava' | 'republic' | 'generic';
  memo?: string;
  referenceNumber: string;
}

export interface SpendingCategoryItem {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface AlertNotification {
  id: string;
  title: string;
  date: string;
  timestamp: string;
  read: boolean;
  type: 'statement' | 'deposit' | 'offer' | 'security';
  description: string;
}

export interface Payee {
  id: string;
  name: string;
  category: string;
  accountNumber: string;
  nickname: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}
