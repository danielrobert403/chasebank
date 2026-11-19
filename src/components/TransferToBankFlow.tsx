import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  History,
  Hash,
  Building2,
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
  Clock,
  Check,
  Search,
} from 'lucide-react';
import { BankAccount, Transaction } from '../types/bank';
import { AdminSettings, PendingTransferItem } from '../types/admin';

export interface InterBankTransferPayload {
  fromId: string;
  receivingBank: string;
  routingNumber: string;
  beneficiaryName: string;
  accountNumber: string;
  transferSpeed: 'FedWire' | 'FedNow' | 'Standard ACH';
  amount: number;
  memo: string;
  securityPin: string;
}

const MAJOR_US_BANKS = [
  { name: 'JPMorgan Chase Bank, N.A.', routing: '021000021' },
  { name: 'Bank of America, N.A.', routing: '026009593' },
  { name: 'Wells Fargo Bank, N.A.', routing: '121000247' },
  { name: 'Citibank, N.A.', routing: '021000089' },
  { name: 'U.S. Bank N.A.', routing: '091000022' },
  { name: 'PNC Bank, N.A.', routing: '043000096' },
  { name: 'Capital One, N.A.', routing: '051405515' },
  { name: 'TD Bank, N.A.', routing: '031101266' },
  { name: 'Truist Bank', routing: '061000104' },
  { name: 'Ally Bank', routing: '124003116' },
  { name: 'Charles Schwab Bank', routing: '121202211' },
  { name: 'Goldman Sachs Bank USA', routing: '124085066' },
];

interface TransferToBankFlowProps {
  accounts: BankAccount[];
  transactions?: Transaction[];
  pendingTransfers?: PendingTransferItem[];
  defaultFromAccount?: BankAccount | null;
  adminSettings?: AdminSettings;
  onExecuteInterBankTransfer: (payload: InterBankTransferPayload) => { requiresApproval: boolean };
  onCancel: () => void;
}

export const TransferToBankFlow: React.FC<TransferToBankFlowProps> = ({
  accounts,
  transactions = [],
  pendingTransfers = [],
  defaultFromAccount,
  adminSettings,
  onExecuteInterBankTransfer,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showHistory, setShowHistory] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [customBankInput, setCustomBankInput] = useState('');

  // Step 1: Recipient
  const [routingNumber, setRoutingNumber] = useState('');
  const [receivingBank, setReceivingBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Step 2: Amount & Account
  const [fromAccountId, setFromAccountId] = useState(defaultFromAccount?.id || accounts[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [transferSpeed, setTransferSpeed] = useState<'FedWire' | 'FedNow' | 'Standard ACH'>('FedWire');
  const [memo, setMemo] = useState('');

  // Step 3: Security Verification
  const [confirmAccount, setConfirmAccount] = useState('');
  const [securityPin, setSecurityPin] = useState('');

  // Result / Validation
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{
    amount: number;
    fromName: string;
    recipientName: string;
    bankName: string;
    routingNumber: string;
    lastFourAcct: string;
    speed: string;
    requiresApproval: boolean;
    confirmationNumber: string;
  } | null>(null);

  useEffect(() => {
    if (defaultFromAccount) {
      setFromAccountId(defaultFromAccount.id);
    } else if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id);
    }
  }, [defaultFromAccount, accounts]);

  const currentFromAcc = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const availableBalance =
    currentFromAcc?.type === 'credit'
      ? (currentFromAcc.availableCredit || 0)
      : (currentFromAcc?.balance || 0);

  const handleRoutingChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    setRoutingNumber(digits);
    setError('');

    const matched = MAJOR_US_BANKS.find((b) => b.routing === digits);
    if (matched) {
      setReceivingBank(matched.name);
    }
  };

  const handleSelectBank = (bank: { name: string; routing: string }) => {
    setReceivingBank(bank.name);
    if (!routingNumber) {
      setRoutingNumber(bank.routing);
    }
    setShowBankPicker(false);
    setBankSearch('');
    setError('');
  };

  const isStep1Valid =
    routingNumber.trim().length === 9 &&
    receivingBank.trim().length > 0 &&
    accountNumber.trim().length >= 4 &&
    recipientName.trim().length > 0;

  const parsedAmount = parseFloat(amountStr);
  const isStep2Valid =
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    !!currentFromAcc &&
    parsedAmount <= availableBalance;

  const isStep3Valid =
    confirmAccount.trim() === accountNumber.trim() &&
    securityPin.trim().length === 4;

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (routingNumber.trim().length !== 9) {
        setError('Please enter a valid 9-digit ABA routing number.');
        return;
      }
      if (!receivingBank.trim()) {
        setError('Please choose or enter a receiving bank.');
        return;
      }
      if (accountNumber.trim().length < 4) {
        setError('Please enter a valid recipient account number (at least 4 digits).');
        return;
      }
      if (!recipientName.trim()) {
        setError('Please enter the recipient’s full legal name.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!currentFromAcc) {
        setError('Please select a source account.');
        return;
      }
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid transfer amount greater than $0.00.');
        return;
      }
      if (parsedAmount > availableBalance) {
        setError(`Transfer amount exceeds available balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`);
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (confirmAccount.trim() !== accountNumber.trim()) {
        setError('Confirmation account number does not match the recipient account number.');
        return;
      }
      if (securityPin.trim().length !== 4) {
        setError('Please enter your 4-digit security PIN to authorize.');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!currentFromAcc) return;
      const result = onExecuteInterBankTransfer({
        fromId: currentFromAcc.id,
        receivingBank: receivingBank.trim(),
        routingNumber: routingNumber.trim(),
        beneficiaryName: recipientName.trim(),
        accountNumber: accountNumber.trim(),
        transferSpeed,
        amount: parsedAmount,
        memo: memo.trim(),
        securityPin: securityPin.trim(),
      });

      setSubmittedDetails({
        amount: parsedAmount,
        fromName: `${currentFromAcc.name} (··${currentFromAcc.lastFour})`,
        recipientName: recipientName.trim(),
        bankName: receivingBank.trim(),
        routingNumber: routingNumber.trim(),
        lastFourAcct: accountNumber.trim().slice(-4),
        speed: transferSpeed,
        requiresApproval: result?.requiresApproval || false,
        confirmationNumber: `FED-${Math.floor(100000000 + Math.random() * 900000000)}`,
      });
      setIsSuccess(true);
    }
  };

  const handleBackButton = () => {
    setError('');
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    if (showBankPicker) {
      setShowBankPicker(false);
      return;
    }
    if (isSuccess) {
      handleResetFlow();
      onCancel();
      return;
    }
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      onCancel();
    }
  };

  const handleResetFlow = () => {
    setStep(1);
    setRoutingNumber('');
    setReceivingBank('');
    setAccountNumber('');
    setRecipientName('');
    setAmountStr('');
    setMemo('');
    setConfirmAccount('');
    setSecurityPin('');
    setError('');
    setIsSuccess(false);
    setSubmittedDetails(null);
  };

  const stepLabels: Record<1 | 2 | 3 | 4, string> = {
    1: 'STEP 1 OF 4 · RECIPIENT',
    2: 'STEP 2 OF 4 · AMOUNT & RAIL',
    3: 'STEP 3 OF 4 · VERIFICATION',
    4: 'STEP 4 OF 4 · REVIEW & CONFIRM',
  };

  const bankTransferHistory = transactions.filter(
    (tx) => tx.merchantLogoKey === 'transfer' || tx.referenceNumber.startsWith('WIRE') || tx.referenceNumber.startsWith('TRF')
  );

  const filteredBanks = MAJOR_US_BANKS.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.routing.includes(bankSearch)
  );

  return (
    <div className="w-full max-w-[440px] mx-auto bg-[#F4F6F9] rounded-3xl p-4 sm:p-6">
      {/* Top Bar matching Screenshot: Circular < back button, Title, History pill */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <button
          type="button"
          onClick={handleBackButton}
          className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/70 shadow-2xs flex items-center justify-center text-slate-800 transition-colors cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        <h2 className="text-[16px] sm:text-[17px] font-bold text-slate-900 tracking-tight text-center truncate">
          {showHistory ? 'Transfer History' : showBankPicker ? 'Select Bank' : 'Transfer to Bank Account'}
        </h2>

        <button
          type="button"
          onClick={() => {
            setShowHistory(!showHistory);
            setShowBankPicker(false);
          }}
          className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs ${
            showHistory
              ? 'bg-[#0F172A] text-white border-[#0F172A]'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* VIEW A: TRANSFER HISTORY */}
      {showHistory ? (
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/60 space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent Bank Transfers
              </p>
              {bankTransferHistory.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No recent bank transfers recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bankTransferHistory.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{tx.description}</p>
                        <p className="text-[11px] text-slate-500 truncate">{tx.subtext}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold font-mono text-slate-900">
                          -${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <span
                          className={`text-[10px] font-semibold ${
                            tx.status === 'Pending'
                              ? 'text-amber-600'
                              : tx.status === 'Declined'
                                ? 'text-rose-600'
                                : 'text-emerald-700'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className="w-full rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs cursor-pointer"
          >
            Back to Transfer
          </button>
        </div>
      ) : showBankPicker ? (
        /* VIEW B: SELECT BANK PICKER */
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/60 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search bank name or routing..."
                className="w-full bg-[#EEF1F6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3968] focus:outline-hidden"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredBanks.map((bank) => {
                const selected = receivingBank === bank.name;
                return (
                  <button
                    key={bank.routing}
                    type="button"
                    onClick={() => handleSelectBank(bank)}
                    className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{bank.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">ABA: {bank.routing}</p>
                    </div>
                    {selected && <Check className="w-4 h-4 text-[#0B3968]" />}
                  </button>
                );
              })}
            </div>

            {/* Custom bank fallback */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Or enter another bank manually</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBankInput}
                  onChange={(e) => setCustomBankInput(e.target.value)}
                  placeholder="Enter bank name..."
                  className="flex-1 bg-[#EEF1F6] rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3968] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customBankInput.trim()) {
                      setReceivingBank(customBankInput.trim());
                      setCustomBankInput('');
                      setShowBankPicker(false);
                    }
                  }}
                  className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#0B3968]"
                >
                  Use
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBankPicker(false)}
            className="w-full rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : isSuccess && submittedDetails ? (
        /* VIEW C: TRANSFER CONFIRMATION RECEIPT */
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] p-6 shadow-xs border border-slate-200/60 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-100 text-amber-600">
              <Clock className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Transfer Initiated</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your {submittedDetails.speed} transfer to {submittedDetails.recipientName} has been submitted and is currently pending.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-[#F6F8FB] border border-slate-200/70 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold font-mono text-slate-900">
                  ${submittedDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">From</span>
                <span className="font-semibold text-slate-800">{submittedDetails.fromName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient</span>
                <span className="font-semibold text-slate-800">{submittedDetails.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank</span>
                <span className="font-semibold text-slate-800">{submittedDetails.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account</span>
                <span className="font-mono text-slate-800">····{submittedDetails.lastFourAcct}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference #</span>
                <span className="font-mono font-semibold text-slate-800">{submittedDetails.confirmationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-amber-600">Pending</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetFlow}
              className="flex-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs cursor-pointer"
            >
              New Transfer
            </button>
            <button
              type="button"
              onClick={() => {
                handleResetFlow();
                onCancel();
              }}
              className="flex-1 rounded-full bg-[#0F172A] hover:bg-[#0B3968] py-3.5 text-sm font-semibold text-white shadow-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* VIEW D: 4-STEP TRANSFER WIZARD MATCHING SCREENSHOT */
        <div>
          {/* 4-Segment Progress Bar */}
          <div className="grid grid-cols-4 gap-2 mb-2.5">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className={`h-[3px] rounded-full transition-colors duration-200 ${
                  idx <= step ? 'bg-[#0F172A]' : 'bg-[#DFE4EC]'
                }`}
              />
            ))}
          </div>

          {/* Step Label */}
          <p className="text-[11px] font-semibold tracking-[0.09em] text-slate-500 uppercase mb-4">
            {stepLabels[step]}
          </p>

          {/* Main Rounded White Form Card */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-slate-200/60 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: RECIPIENT (Matches attached screenshot field-for-field) */}
            {step === 1 && (
              <>
                {/* Routing Number */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 mb-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>Routing Number</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={routingNumber}
                    onChange={(e) => handleRoutingChange(e.target.value)}
                    placeholder="9 digits"
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-mono outline-hidden transition-all"
                  />
                </div>

                {/* Select Bank */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Select Bank</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBankPicker(true)}
                    className="w-full bg-[#EEF1F6] hover:bg-[#E7EBF2] rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <span className={receivingBank ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                      {receivingBank || 'Choose a bank...'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>

                {/* Account Number */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 mb-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>Account Number</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 placeholder:tracking-widest font-mono outline-hidden transition-all"
                  />
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 mb-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Recipient Name</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);
                      setError('');
                    }}
                    placeholder="Full legal name"
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                  />
                </div>
              </>
            )}

            {/* STEP 2: AMOUNT & FUNDING */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                    From Account
                  </label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => {
                      setFromAccountId(e.target.value);
                      setError('');
                    }}
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-hidden transition-all cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (··{acc.lastFour}) — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-semibold text-slate-800">
                      Amount ($ USD)
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Avail: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amountStr}
                      onChange={(e) => {
                        if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                          setAmountStr(e.target.value);
                          setError('');
                        }
                      }}
                      placeholder="0.00"
                      className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl pl-8 pr-4 py-3 text-base font-bold font-mono text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    {[100, 500, 1000, 2500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setAmountStr(amt.toString());
                          setError('');
                        }}
                        className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-[#EEF1F6] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        ${amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                    Transfer Speed
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: 'FedWire', sub: 'Same-day' },
                      { id: 'FedNow', sub: 'Instant' },
                      { id: 'Standard ACH', sub: '1-2 days' },
                    ] as const).map((rail) => (
                      <button
                        key={rail.id}
                        type="button"
                        onClick={() => setTransferSpeed(rail.id)}
                        className={`p-2.5 rounded-xl text-center transition-all cursor-pointer border ${
                          transferSpeed === rail.id
                            ? 'bg-[#0F172A] text-white border-[#0F172A]'
                            : 'bg-[#EEF1F6] text-slate-800 border-transparent hover:bg-slate-200/70'
                        }`}
                      >
                        <div className="text-xs font-bold">{rail.id}</div>
                        <div className={`text-[10px] mt-0.5 ${transferSpeed === rail.id ? 'text-slate-300' : 'text-slate-500'}`}>
                          {rail.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="e.g. Vendor invoice, rent, savings"
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                  />
                </div>
              </>
            )}

            {/* STEP 3: SECURITY VERIFICATION */}
            {step === 3 && (
              <>
                <div className="p-3.5 rounded-xl bg-[#F6F8FB] border border-slate-200/80 text-xs text-slate-600">
                  Sending{' '}
                  <span className="font-bold font-mono text-slate-900">
                    ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>{' '}
                  to <span className="font-semibold text-slate-900">{recipientName}</span> at{' '}
                  <span className="font-semibold text-slate-900">{receivingBank}</span>.
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 mb-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>Confirm Account Number</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={confirmAccount}
                    onChange={(e) => {
                      setConfirmAccount(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="Re-enter account number"
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 outline-hidden transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Security PIN</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">4-digit PIN</span>
                  </div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={securityPin}
                    onChange={(e) => {
                      setSecurityPin(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="••••"
                    className="w-full bg-[#EEF1F6] border border-transparent focus:border-[#0B3968] focus:bg-white rounded-xl px-4 py-3 text-base font-mono tracking-[0.4em] text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
                  />
                </div>

              </>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}
            {step === 4 && (
              <div className="space-y-3 text-xs">
                <div className="text-center pb-3 border-b border-slate-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Total Transfer Amount
                  </p>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">From Account</span>
                    <span className="font-semibold text-slate-900">
                      {currentFromAcc?.name} (··{currentFromAcc?.lastFour})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient</span>
                    <span className="font-semibold text-slate-900">{recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receiving Bank</span>
                    <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{receivingBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ABA Routing</span>
                    <span className="font-mono text-slate-800">{routingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number</span>
                    <span className="font-mono text-slate-800">····{accountNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transfer Rail</span>
                    <span className="font-semibold text-[#0B3968]">{transferSpeed}</span>
                  </div>
                  {memo && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Memo</span>
                      <span className="text-slate-800 truncate max-w-[200px]">{memo}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Pill Action Buttons matching Screenshot */}
          <div className="flex items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => {
                setError('');
                if (step > 1) {
                  setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                } else {
                  onCancel();
                }
              }}
              className="flex-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 py-3.5 text-sm font-semibold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 rounded-full py-3.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer ${
                (step === 1 && isStep1Valid) ||
                (step === 2 && isStep2Valid) ||
                (step === 3 && isStep3Valid) ||
                step === 4
                  ? 'bg-[#0F172A] hover:bg-[#0B3968]'
                  : 'bg-[#6D738A] hover:bg-[#5E647B]'
              }`}
            >
              {step === 4 ? 'Send Transfer' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
