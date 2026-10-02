import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Cpu, 
  DollarSign, 
  Film, 
  Clock, 
  AlertTriangle, 
  Search, 
  Plus, 
  Minus, 
  Check, 
  RotateCw, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { AdminAnalytics, UserProfile, UsdtPaymentRecord } from '../types';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'jobs' | 'providers' | 'plans'>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState<number>(100);
  const [creditAdjustReason, setCreditAdjustReason] = useState('Founder grant');
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<UsdtPaymentRecord[]>([]);
  const [searchPaymentQuery, setSearchPaymentQuery] = useState('');
  const [providersData, setProvidersData] = useState<any>(null);
  const [plansList, setPlansList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Strictly verify authorization
  const isAuthorized = currentUser?.role === 'founder' || currentUser?.role === 'admin';

  useEffect(() => {
    if (isAuthorized) {
      loadAdminData();
    }
  }, [isAuthorized]);

  const loadAdminData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Fetch analytics
      const analyticsRes = await fetch('/api/admin/analytics');
      if (!analyticsRes.ok) {
        throw new Error('Access denied. Founder privileges required.');
      }
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics);

      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsersList(usersData.users || []);

      // Fetch jobs
      const jobsRes = await fetch('/api/admin/jobs');
      const jobsData = await jobsRes.json();
      setJobsList(jobsData.jobs || []);

      // Fetch USDT Payments
      const paymentsRes = await fetch('/api/admin/payments');
      const paymentsData = await paymentsRes.json();
      setPaymentsList(paymentsData.payments || []);

      // Fetch providers
      const provRes = await fetch('/api/admin/providers');
      const provData = await provRes.json();
      setProvidersData(provData);

      // Fetch plans
      const plansRes = await fetch('/api/admin/plans');
      const plansData = await plansRes.json();
      setPlansList(plansData.plans || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unauthorized or server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: `Manual review by Founder (${action})` })
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Payment ${action === 'approve' ? 'approved & subscription credited' : 'rejected'}`);
        loadAdminData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: creditAdjustment,
          reason: creditAdjustReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Updated ${selectedUser.email} credits to ${data.credits}`);
        loadAdminData();
        setSelectedUser(data.user);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const nextStatus = user.subscriptionStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setActionSuccess(`User status changed to ${nextStatus}`);
        loadAdminData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mx-auto mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">403 Access Denied</h2>
        <p className="text-xs text-neutral-400 mt-2 mb-6">
          This portal is guarded by server-side role validation. Only founder and administrator accounts can access this console.
        </p>
        <button
          onClick={onClose}
          className="rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 cursor-pointer"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Founder & Admin Console</h1>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Server Authorized
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Live telemetry, user quota control, pipeline queue, and AI provider status.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors self-start sm:self-auto cursor-pointer"
        >
          Close Console
        </button>
      </div>

      {actionSuccess && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {actionSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 mb-6 text-xs">
        {[
          { id: 'overview', label: 'Overview & Metrics', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'payments', label: 'USDT Payments', icon: DollarSign },
          { id: 'jobs', label: 'Generation Jobs', icon: Clock },
          { id: 'providers', label: 'AI Provider Health', icon: Cpu },
          { id: 'plans', label: 'Plan & Tier Quotas', icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] text-neutral-500 block">Total Registered Users</span>
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {analytics.totalUsers}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-1">+4 today</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] text-neutral-500 block">Active Subscriptions</span>
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {analytics.activeSubscriptions}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1">Creator & Pro tiers</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] text-neutral-500 block">Revenue MTD</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
                ${analytics.revenueMtd}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1">Stripe auto-settled</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] text-neutral-500 block">Videos Generated</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-mono tabular-nums">
                {analytics.videosGenerated}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1">
                {analytics.totalGenerationMinutes} min runtime
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-xs text-neutral-400 block">Credits Consumed</span>
              <span className="text-xl font-bold text-white font-mono tabular-nums">
                {analytics.creditsUsed} Credits
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-xs text-neutral-400 block">Failed Pipeline Jobs</span>
              <span className="text-xl font-bold text-rose-400 font-mono tabular-nums">
                {analytics.failedJobsCount}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Isolated by retry policy</span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-xs text-neutral-400 block">Cloud Storage Used</span>
              <span className="text-xl font-bold text-white font-mono tabular-nums">
                {analytics.storageUsedGb} GB
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Master video assets</span>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Search by email, name or role..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User List Table */}
            <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Credits</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {usersList
                    .filter(u => 
                      !searchUserQuery || 
                      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
                    )
                    .map((user) => (
                      <tr 
                        key={user.id} 
                        onClick={() => setSelectedUser(user)}
                        className={`hover:bg-neutral-800/40 cursor-pointer ${
                          selectedUser?.id === user.id ? 'bg-indigo-500/10' : ''
                        }`}
                      >
                        <td className="py-2 px-3">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-[11px] text-neutral-500">{user.email}</p>
                        </td>
                        <td className="py-2 px-3 capitalize">{user.role}</td>
                        <td className="py-2 px-3 capitalize">{user.subscriptionPlan}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-400 tabular-nums">
                          {user.credits}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleUserStatus(user);
                            }}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer ${
                              user.subscriptionStatus === 'active'
                                ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                          >
                            {user.subscriptionStatus === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* User Details & Credit Adjustment Panel */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              {selectedUser ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white border-b border-neutral-800 pb-2">
                    Manage {selectedUser.name}
                  </h3>

                  <div className="text-xs space-y-1 text-neutral-400">
                    <p><span className="text-neutral-500">ID:</span> {selectedUser.id}</p>
                    <p><span className="text-neutral-500">Email:</span> {selectedUser.email}</p>
                    <p><span className="text-neutral-500">Role:</span> {selectedUser.role}</p>
                    <p><span className="text-neutral-500">Plan:</span> {selectedUser.subscriptionPlan}</p>
                    <p><span className="text-neutral-500">Balance:</span> <span className="font-mono text-white font-bold">{selectedUser.credits} Credits</span></p>
                  </div>

                  <div className="border-t border-neutral-800 pt-3">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Add / Deduct Credits
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        value={creditAdjustment}
                        onChange={(e) => setCreditAdjustment(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      value={creditAdjustReason}
                      onChange={(e) => setCreditAdjustReason(e.target.value)}
                      placeholder="Reason for adjustment..."
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-200 mb-3 focus:outline-none"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={handleAdjustCredits}
                        className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                      >
                        Apply Adjustment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 text-center py-8">
                  Select a user from the table to manage credits or review status.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USDT Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchPaymentQuery}
                onChange={(e) => setSearchPaymentQuery(e.target.value)}
                placeholder="Search by user, TXID, or network..."
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Total Recorded: <span className="font-mono font-bold text-white">{paymentsList.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Network</th>
                  <th className="py-2.5 px-3">Wallet Address</th>
                  <th className="py-2.5 px-3">TXID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verification Details</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {paymentsList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-neutral-500">
                      No USDT payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  paymentsList
                    .filter(p =>
                      !searchPaymentQuery ||
                      p.userEmail.toLowerCase().includes(searchPaymentQuery.toLowerCase()) ||
                      p.userName.toLowerCase().includes(searchPaymentQuery.toLowerCase()) ||
                      p.txid.toLowerCase().includes(searchPaymentQuery.toLowerCase()) ||
                      p.network.toLowerCase().includes(searchPaymentQuery.toLowerCase())
                    )
                    .map((p) => {
                      const truncatedAddress = `${p.walletAddress.slice(0, 6)}...${p.walletAddress.slice(-4)}`;
                      const truncatedTxid = `${p.txid.slice(0, 8)}...${p.txid.slice(-6)}`;
                      const isPending = p.status === 'pending_verification';

                      return (
                        <tr key={p.id} className="hover:bg-neutral-800/40">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                            {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-white block">{p.userName}</span>
                            <span className="text-[11px] text-neutral-500 block">{p.userEmail}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-white">{p.planName}</span>
                            <span className="text-[10px] text-neutral-400 block capitalize">{p.billingCadence}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                            {p.amountUsdt} USDT
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                              p.network === 'TRC20' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {p.network}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400" title={p.walletAddress}>
                            {truncatedAddress}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-300" title={p.txid}>
                            {truncatedTxid}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-mono capitalize ${
                                p.status === 'verified'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : p.status === 'pending_verification'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : p.status === 'already_used'
                                  ? 'bg-purple-500/10 text-purple-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {p.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-neutral-400 max-w-xs truncate" title={p.verificationResult}>
                            {p.verificationResult || 'Confirmed on blockchain'}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleReviewPayment(p.id, 'approve')}
                                  className="rounded bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReviewPayment(p.id, 'reject')}
                                  className="rounded bg-rose-600/80 hover:bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-neutral-500">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Scenes</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {jobsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-neutral-500">
                    No asynchronous generation jobs in queue.
                  </td>
                </tr>
              ) : (
                jobsList.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-800/40">
                    <td className="py-2 px-3 font-mono text-[11px] text-neutral-400">{job.id}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-neutral-400">{job.projectId}</td>
                    <td className="py-2 px-3 capitalize">{job.currentStage}</td>
                    <td className="py-2 px-3 font-mono">{job.progress}%</td>
                    <td className="py-2 px-3 font-mono">
                      {job.completedScenes} / {job.totalScenes}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                          job.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : job.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Providers Tab */}
      {activeTab === 'providers' && providersData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providersData.providers?.map((prov: any) => (
              <div key={prov.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-xs">{prov.name}</h4>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 font-mono">
                    {prov.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-400 mt-3 pt-3 border-t border-neutral-800">
                  <div>
                    <span className="block text-neutral-500 text-[10px]">Avg Latency</span>
                    <span className="font-mono text-neutral-200">{prov.avgLatencyMs}ms</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500 text-[10px]">Requests 24h</span>
                    <span className="font-mono text-neutral-200">{prov.requests24h}</span>
                  </div>
                  <div>
                    <span className="block text-neutral-500 text-[10px]">Error Rate</span>
                    <span className="font-mono text-neutral-200">{prov.errorRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <h4 className="text-xs font-semibold text-white mb-2">Founder Audit Log</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto text-[11px] font-mono text-neutral-400">
              {providersData.adminLogs?.map((log: any) => (
                <div key={log.id} className="border-b border-neutral-800/60 pb-1">
                  <span className="text-neutral-500">{new Date(log.timestamp).toLocaleTimeString()}</span>{' '}
                  <span className="text-indigo-400">[{log.action}]</span> {log.details}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plansList.map((plan: any) => (
            <div key={plan.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <h4 className="font-bold text-white text-sm mb-2">{plan.name} Tier</h4>
              <div className="space-y-2 text-xs text-neutral-300">
                <p><span className="text-neutral-500">Monthly Price:</span> ${plan.monthlyPrice}</p>
                <p><span className="text-neutral-500">Yearly Price:</span> ${plan.yearlyPrice}/mo</p>
                <p><span className="text-neutral-500">Credits:</span> {plan.creditsMonthly}/mo</p>
                <p><span className="text-neutral-500">Max Video Duration:</span> {plan.maxDurationMinutes} minutes</p>
                <p><span className="text-neutral-500">Watermark:</span> {plan.hasWatermark ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
