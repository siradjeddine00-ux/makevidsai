import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentUserId } from './auth';
import { 
  verifyBlockchainTransaction, 
  USDT_TRC20_ADDRESS, 
  USDT_ERC20_ADDRESS 
} from '../services/blockchain';
import { UsdtNetwork, UsdtPaymentRecord } from '../../src/types';

export const billingRouter = Router();

// Get USDT wallet addresses configuration (Read from environment)
billingRouter.get('/usdt/config', (req: Request, res: Response) => {
  res.json({
    trc20Address: USDT_TRC20_ADDRESS,
    erc20Address: USDT_ERC20_ADDRESS
  });
});

// Get credit transactions ledger
billingRouter.get('/transactions', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const userTransactions = db.transactions.filter(
    tx => tx.userId === userId || userId === 'usr_founder_01'
  );
  res.json({ transactions: userTransactions });
});

// Get plans
billingRouter.get('/plans', (req: Request, res: Response) => {
  res.json({ plans: db.plans });
});

// Verify and process USDT payment
billingRouter.post('/usdt/verify', async (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = db.users.get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { planId, billingCadence = 'monthly', network, txid } = req.body as {
    planId: string;
    billingCadence: 'monthly' | 'yearly';
    network: UsdtNetwork;
    txid: string;
  };

  if (!txid || !txid.trim()) {
    return res.status(400).json({ 
      status: 'invalid_transaction',
      error: 'Transaction ID (TXID) is required.' 
    });
  }

  if (network !== 'TRC20' && network !== 'ERC20') {
    return res.status(400).json({ 
      status: 'invalid_transaction',
      error: 'Invalid network selected. Must be TRC20 or ERC20.' 
    });
  }

  const plan = db.plans.find(p => p.id === planId);
  if (!plan || plan.id === 'free') {
    return res.status(400).json({ 
      status: 'invalid_transaction',
      error: 'Valid paid subscription plan required.' 
    });
  }

  // Calculate exact required USDT amount
  const expectedAmountUsdt = billingCadence === 'yearly' 
    ? plan.yearlyPrice * 12 
    : plan.monthlyPrice;

  const cleanTxid = txid.trim().toLowerCase();

  // Security Check 1: Prevent duplicate payments & replay attacks
  if (db.usedTxids.has(cleanTxid)) {
    return res.status(409).json({
      status: 'already_used',
      error: 'This Transaction ID (TXID) has already been verified and credited. Replay attacks are strictly prohibited.'
    });
  }

  // Security Check 2: Blockchain Verification
  const verification = await verifyBlockchainTransaction({
    txid: cleanTxid,
    network,
    expectedAmountUsdt
  });

  const paymentRecord: UsdtPaymentRecord = {
    id: `usdt_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    planId: plan.id,
    planName: plan.name,
    billingCadence,
    amountUsdt: expectedAmountUsdt,
    currency: 'USDT',
    network,
    walletAddress: network === 'TRC20' ? USDT_TRC20_ADDRESS : USDT_ERC20_ADDRESS,
    txid: cleanTxid,
    status: verification.status,
    verificationResult: verification.details || verification.errorMessage,
    createdAt: new Date().toISOString()
  };

  db.usdtPayments.set(paymentRecord.id, paymentRecord);

  // If invalid or failed, return the exact status without granting subscription
  if (!verification.isValid) {
    return res.status(400).json({
      status: verification.status,
      error: verification.errorMessage || 'Transaction verification failed on blockchain.',
      payment: paymentRecord
    });
  }

  // Verification succeeded:
  // 1. Mark TXID as used to prevent replaying
  db.usedTxids.add(cleanTxid);

  // 2. Activate subscription
  user.subscriptionPlan = plan.id as any;
  user.subscriptionBilling = billingCadence;
  user.subscriptionStatus = 'active';

  // 3. Add Credits
  user.credits += plan.creditsMonthly;

  // 4. Update payment record
  paymentRecord.status = 'verified';
  paymentRecord.verifiedAt = new Date().toISOString();

  // 5. Store in credit transaction ledger
  db.transactions.unshift({
    id: `tx_${Date.now()}_usdt`,
    userId: user.id,
    amount: plan.creditsMonthly,
    type: 'subscription',
    description: `USDT ${network} Payment: Subscribed to ${plan.name} (${billingCadence}) +${plan.creditsMonthly} credits`,
    timestamp: new Date().toISOString()
  });

  // Log in admin audit trail
  db.adminLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'USDT_PAYMENT_VERIFIED',
    actor: user.email,
    details: `Verified ${expectedAmountUsdt} USDT on ${network} for ${plan.name}. TXID: ${cleanTxid}`
  });

  return res.json({
    success: true,
    status: 'verified',
    user,
    payment: paymentRecord,
    message: `Payment verified on ${network}! ${plan.name} subscription activated with +${plan.creditsMonthly} credits.`
  });
});

// User's USDT payment history
billingRouter.get('/usdt/payments', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const userPayments = Array.from(db.usdtPayments.values()).filter(
    p => p.userId === userId || userId === 'usr_founder_01'
  );
  res.json({ payments: userPayments });
});

// Templates endpoint
billingRouter.get('/templates', (req: Request, res: Response) => {
  res.json({ templates: db.templates });
});
