import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Zap, 
  Clock, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowLeft, 
  QrCode, 
  ShieldCheck, 
  RotateCw,
  Coins
} from 'lucide-react';
import { UserProfile, CreditTransaction, UsdtNetwork, UsdtPaymentRecord, PaymentStatus } from '../types';
import { QrCodeSvg } from './QrCodeSvg';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onPlanChanged: (updatedUser: UserProfile) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPlanChanged
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [usdtPayments, setUsdtPayments] = useState<UsdtPaymentRecord[]>([]);

  // Checkout flow state
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    creditsMonthly: number;
  } | null>(null);

  const [selectedNetwork, setSelectedNetwork] = useState<UsdtNetwork>('TRC20');
  const [hasPaidStep, setHasPaidStep] = useState(false);
  const [txidInput, setTxidInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<{ status: PaymentStatus; message: string } | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  // Addresses dynamically loaded from server environment
  const [usdtConfig, setUsdtConfig] = useState<{ trc20Address: string; erc20Address: string }>({
    trc20Address: 'TMVfsdPa8eJLXWjQENnHwpsyG86Uxrwpef',
    erc20Address: '0x3a29d57a688b8e9c333c34129dc99116d8a7d281'
  });

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      fetchLedger();
      fetchUsdtPayments();
      // Reset checkout states
      setSelectedPlanForCheckout(null);
      setHasPaidStep(false);
      setTxidInput('');
      setVerificationError(null);
      setVerificationSuccess(null);
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/billing/usdt/config');
      const data = await res.json();
      if (res.ok && data.trc20Address) {
        setUsdtConfig(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/billing/transactions');
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsdtPayments = async () => {
    try {
      const res = await fetch('/api/billing/usdt/payments');
      const data = await res.json();
      if (res.ok) {
        setUsdtPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      monthlyPrice: 0,
      yearlyPrice: 0,
      creditsMonthly: 50,
      maxDur: '1 minute',
      watermark: true,
      features: ['50 credits monthly', 'Up to 1 min videos', '720p resolution', 'MakeVidsAI watermark']
    },
    {
      id: 'creator',
      name: 'Creator Studio',
      monthlyPrice: 29,
      yearlyPrice: 24,
      creditsMonthly: 500,
      maxDur: '10 minutes',
      watermark: false,
      features: ['500 credits monthly', 'Up to 10 min videos', '1080p Full HD', 'No watermark', 'Full scene editor']
    },
    {
      id: 'pro',
      name: 'Pro Production',
      monthlyPrice: 79,
      yearlyPrice: 65,
      creditsMonthly: 1500,
      maxDur: '30 minutes',
      watermark: false,
      features: ['1,500 credits monthly', 'Full 30-min long videos', 'Character consistency', 'Priority GPU queue', '4K render']
    }
  ];

  const currentAddress = selectedNetwork === 'TRC20' 
    ? usdtConfig.trc20Address 
    : usdtConfig.erc20Address;

  const currentAmountUsdt = selectedPlanForCheckout
    ? billingPeriod === 'yearly'
      ? selectedPlanForCheckout.yearlyPrice * 12
      : selectedPlanForCheckout.monthlyPrice
    : 0;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!txidInput.trim() || !selectedPlanForCheckout) return;

    setIsVerifying(true);
    setVerificationError(null);
    setVerificationSuccess(null);

    try {
      const res = await fetch('/api/billing/usdt/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanForCheckout.id,
          billingCadence: billingPeriod,
          network: selectedNetwork,
          txid: txidInput.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setVerificationError({
          status: data.status || 'failed',
          message: data.error || 'Verification failed on blockchain.'
        });
        return;
      }

      // Success
      setVerificationSuccess(data.message || 'Payment verified! Subscription activated.');
      if (data.user) {
        onPlanChanged(data.user);
      }
      fetchLedger();
      fetchUsdtPayments();
    } catch (err: any) {
      setVerificationError({
        status: 'failed',
        message: err.message || 'Network communication error during payment verification.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">USDT Subscription Billing</h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  TRC20 & ERC20
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Direct blockchain settlement with zero card processor fees.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[11px] text-neutral-500 block uppercase tracking-wider">
                Current Balance
              </span>
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {currentUser?.credits ?? 0}
              </span>
              <span className="text-xs text-neutral-400 ml-1.5">Credits Available</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-neutral-300">
              Active Plan:{' '}
              <span className="font-semibold text-white capitalize">
                {currentUser?.subscriptionPlan}
              </span>
            </div>
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-neutral-300">
              Status:{' '}
              <span className="font-semibold text-emerald-400 capitalize">
                {currentUser?.subscriptionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* VIEW 1: PLAN SELECTION */}
        {!selectedPlanForCheckout ? (
          <>
            {/* Cadence Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    billingPeriod === 'monthly' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    billingPeriod === 'yearly' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Yearly Billing (Save 20%)
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {plans.map((plan) => {
                const isCurrent = currentUser?.subscriptionPlan === plan.id;
                const monthlyPrice = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                const totalDue = billingPeriod === 'yearly' ? plan.yearlyPrice * 12 : plan.monthlyPrice;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-md'
                        : 'border-neutral-800 bg-neutral-950/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm text-white">{plan.name}</h3>
                        {isCurrent && (
                          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-3xl font-extrabold text-white font-mono">{monthlyPrice}</span>
                        <span className="text-xs font-semibold text-emerald-400">USDT</span>
                        <span className="text-xs text-neutral-400">/ mo</span>
                      </div>

                      {billingPeriod === 'yearly' && plan.yearlyPrice > 0 && (
                        <p className="text-[11px] text-neutral-400 font-mono mb-2">
                          Total: {totalDue} USDT billed annually
                        </p>
                      )}

                      <div className="space-y-2 text-xs text-neutral-300 my-4">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled={isCurrent || plan.id === 'free'}
                      onClick={() => {
                        setSelectedPlanForCheckout(plan);
                        setHasPaidStep(false);
                        setVerificationError(null);
                        setVerificationSuccess(null);
                      }}
                      className={`mt-4 w-full rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'border border-neutral-800 bg-neutral-900 text-neutral-500 cursor-default'
                          : plan.id === 'free'
                          ? 'border border-neutral-800 bg-neutral-900 text-neutral-400 cursor-default'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Free Tier' : 'Pay with USDT →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* VIEW 2: USDT CHECKOUT STEP & CONFIRMATION */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Plans
              </button>

              <div className="text-xs text-neutral-300">
                Plan: <span className="font-semibold text-white">{selectedPlanForCheckout.name}</span>{' '}
                ({billingPeriod})
              </div>
            </div>

            {/* Network Selector */}
            <div>
              <span className="block text-xs font-semibold text-neutral-300 mb-2">
                Choose USDT Network:
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNetwork('TRC20');
                    setVerificationError(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNetwork === 'TRC20'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">USDT TRC20</span>
                    <span className="text-[10px] text-emerald-400 font-medium">TRON Network</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Lowest network gas fees & fast confirmation</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedNetwork('ERC20');
                    setVerificationError(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNetwork === 'ERC20'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">USDT ERC20</span>
                    <span className="text-[10px] text-indigo-400 font-medium">Ethereum Network</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Standard Ethereum ERC20 smart contract</p>
                </button>
              </div>
            </div>

            {/* Amount to send */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-neutral-500 block uppercase tracking-wider">
                  Amount to send
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                    {currentAmountUsdt}
                  </span>
                  <span className="text-base font-bold text-white">USDT</span>
                  <span className="text-xs text-neutral-400">({selectedNetwork})</span>
                </div>
              </div>

              <div className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs text-neutral-300">
                <span className="text-neutral-500 block text-[10px]">Selected Network</span>
                <span className="font-bold text-emerald-400">USDT {selectedNetwork}</span>
              </div>
            </div>

            {/* Address & QR Code Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
              <div className="flex justify-center md:col-span-1">
                <QrCodeSvg value={currentAddress} size={150} />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-neutral-300">
                      USDT {selectedNetwork} Deposit Wallet Address:
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-medium">
                      Network: {selectedNetwork}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentAddress}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-200 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {addressCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {addressCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Important Network Warning Note */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Send only USDT on {selectedNetwork} to this address.</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Warning: Sending any other asset or transferring through a mismatched network (e.g. BSC, Polygon, Solana) will result in permanent loss of funds.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Confirmation Section: "I Have Paid" */}
            {!hasPaidStep ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHasPaidStep(true)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  I Have Paid
                </button>
              </div>
            ) : (
              /* Step 2: Enter TXID & Verification */
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
                <div className="border-b border-neutral-800 pb-2">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Verify Blockchain Transaction
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Enter the Transaction Hash (TXID) from your wallet or exchange to verify and activate your subscription.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">User Account</span>
                    <span className="font-semibold text-white">{currentUser?.name}</span>
                    <span className="text-neutral-400 text-[11px] block">{currentUser?.email}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">Target Network & Amount</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {currentAmountUsdt} USDT ({selectedNetwork})
                    </span>
                    <span className="text-neutral-400 text-[11px] block">{selectedPlanForCheckout.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Transaction ID / TXID
                  </label>
                  <input
                    type="text"
                    value={txidInput}
                    onChange={(e) => setTxidInput(e.target.value)}
                    placeholder={
                      selectedNetwork === 'TRC20'
                        ? 'e.g. 9f2a74c8e10398bb55f41cb837d99540b93856da96f7c6a9926a11e8f2371a5b'
                        : 'e.g. 0x8f2d591b70d06114a872659e19a4e69b0fa525208f370e2842416f0b40eb938b'
                    }
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Found in your wallet or exchange withdrawal history under "Transaction Hash" or "TXID".
                  </p>
                </div>

                {/* State Feedback Banners */}
                {verificationError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                    <div>
                      <span className="font-bold capitalize block">
                        Status: {verificationError.status.replace('_', ' ')}
                      </span>
                      <span>{verificationError.message}</span>
                    </div>
                  </div>
                )}

                {verificationSuccess && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <span className="font-bold block">Status: Verified</span>
                      <span>{verificationSuccess}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setHasPaidStep(false)}
                    className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    ← Review Address & QR
                  </button>

                  <button
                    type="button"
                    disabled={!txidInput.trim() || isVerifying}
                    onClick={handleVerifyPayment}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    {isVerifying ? (
                      <RotateCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {isVerifying ? 'Verifying on Blockchain...' : 'Verify Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real Credit Transaction & USDT Payment Ledger */}
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-500" />
            Credit Transactions & Settlement Ledger
          </h4>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden max-h-44 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="p-4 text-xs text-neutral-500 text-center">No transactions recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-900/40">
                      <td className="py-2 px-3 text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3">{tx.description}</td>
                      <td className="py-2 px-3 capitalize text-neutral-400">{tx.type}</td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-semibold tabular-nums ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
