import { Router, Request, Response } from 'express';
import { db } from '../db';
import { UserProfile, UserRole } from '../../src/types';

export const authRouter = Router();

// Middleware helper to get active user ID from header or default to founder
export function getCurrentUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId && db.users.has(headerUserId)) {
    return headerUserId;
  }
  // Default to founder for seamless testing
  return 'usr_founder_01';
}

// Current user profile
authRouter.get('/me', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// Login / switch user
authRouter.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email
  for (const user of db.users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return res.json({ user, token: user.id });
    }
  }

  return res.status(401).json({ error: 'Invalid credentials. User does not exist.' });
});

// Quick switch role (User, Creator, Founder/Admin) for testing
authRouter.post('/switch-role', (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  let targetUser: UserProfile | undefined;
  for (const u of db.users.values()) {
    if (u.role === role) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    // Create new test user with that role
    targetUser = {
      id: `usr_${role}_${Date.now()}`,
      email: `${role}@makevids.ai`,
      name: `${role.toUpperCase()} Tester`,
      role,
      credits: role === 'founder' || role === 'admin' ? 5000 : role === 'creator' ? 500 : 50,
      subscriptionPlan: role === 'founder' || role === 'admin' ? 'pro' : role === 'creator' ? 'creator' : 'free',
      subscriptionBilling: 'monthly',
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString()
    };
    db.users.set(targetUser.id, targetUser);
  }

  return res.json({ user: targetUser, token: targetUser.id });
});

// Register
authRouter.post('/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check duplicate
  for (const u of db.users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ error: 'Email already registered' });
    }
  }

  const newUser: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email,
    name,
    role: 'user',
    credits: 50,
    subscriptionPlan: 'free',
    subscriptionBilling: 'monthly',
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString()
  };

  db.users.set(newUser.id, newUser);

  db.transactions.push({
    id: `tx_${Date.now()}`,
    userId: newUser.id,
    amount: 50,
    type: 'subscription',
    description: 'Welcome bonus free credits',
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({ user: newUser, token: newUser.id });
});
