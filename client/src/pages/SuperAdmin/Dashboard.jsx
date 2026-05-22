import { Store, TrendingUp, ShieldAlert, Clock, UserPlus, AlertTriangle, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { superAdminService } from '../../services/superadmin';

const planColor = { FREE: 'bg-gray-100 text-gray-600', STARTER: 'bg-blue-100 text-blue-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-amber-100 text-amber-700' };
const statusColor = { ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-blue-100 text-blue-600', EXPIRED: 'bg-red-100 text-red-600', BLOCKED: 'bg-gray-100 text-gray-500' };

function StatCard({ icon, label, value, sub, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        <p className="text-[0.78rem] font-semibold text-gray-500">{label}</p>
        {sub && <p className="text-[0.7rem] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const methodLabel = { BKASH: 'bKash', NAGAD: 'Nagad' };
const planAmount  = { STARTER: 499, PROFESSIONAL: 999, ENTERPRISE: 2999 };

export default function SADashboard() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sa-dashboard'],
    queryFn: superAdminService.dashboard,
    refetchInterval: 60_000,
  });

  const { data: prData, isLoading: prLoading } = useQuery({
    queryKey: ['sa-payment-requests'],
    queryFn: () => superAdminService.getPaymentRequests('PENDING'),
    refetchInterval: 30_000,
  });

  const approve = useMutation({
    mutationFn: id => superAdminService.approvePayment(id),
    onSuccess:  ()  => qc.invalidateQueries({ queryKey: ['sa-payment-requests'] }),
  });

  const reject = useMutation({
    mutationFn: id => superAdminService.rejectPayment(id),
    onSuccess:  ()  => qc.invalidateQueries({ queryKey: ['sa-payment-requests'] }),
  });

  const d = data?.data;
  const pendingPayments = prData?.data || [];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-[0.78rem] text-gray-400 mt-0.5">সব দোকানের সামগ্রিক চিত্র</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Store size={22} />}       label="মোট দোকান"       value={d?.stats.totalShops || 0}    iconBg="bg-indigo-100" iconColor="text-indigo-600" />
        <StatCard icon={<TrendingUp size={22} />}  label="Active দোকান"    value={d?.stats.activeShops || 0}   sub="সক্রিয় subscription" iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard icon={<UserPlus size={22} />}    label="এই মাসে নতুন"   value={d?.stats.newThisMonth || 0}  sub="নতুন signup" iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard icon={<TrendingUp size={22} />}  label="মাসিক Revenue"   value={`৳${(d?.stats.estimatedMonthlyRevenue || 0).toLocaleString()}`} sub="সক্রিয় subscription থেকে" iconBg="bg-amber-100" iconColor="text-amber-600" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Clock size={20} />}       label="Trial দোকান"     value={d?.stats.trialShops || 0}    iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard icon={<AlertTriangle size={20}/>} label="Expired"        value={d?.stats.expiredShops || 0}  iconBg="bg-red-100" iconColor="text-red-500" />
        <StatCard icon={<ShieldAlert size={20} />} label="Blocked"         value={d?.stats.blockedShops || 0}  iconBg="bg-gray-100" iconColor="text-gray-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expiring soon */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="font-bold text-gray-800 text-[0.9rem]">শীঘ্রই Expire হবে</p>
            <span className="bg-red-100 text-red-600 text-[0.72rem] font-bold px-2 py-1 rounded-lg">{d?.expiringSoon?.length || 0}টি দোকান</span>
          </div>
          {!d?.expiringSoon?.length ? (
            <div className="px-5 py-8 text-center text-[0.82rem] text-gray-400">কোনো দোকান শীঘ্রই expire হচ্ছে না</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {d.expiringSoon.map(s => {
                const days = Math.ceil((new Date(s.subscriptionEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <Link key={s.id} to={`/superadmin/shops/${s.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-red-50/40 transition-colors">
                    <div>
                      <p className="text-[0.83rem] font-semibold text-gray-800">{s.name}</p>
                      <span className={`text-[0.68rem] font-bold px-1.5 py-0.5 rounded-md ${planColor[s.subscriptionPlan]}`}>{s.subscriptionPlan}</span>
                    </div>
                    <span className="text-[0.78rem] font-bold text-red-500">{days} দিন বাকি</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Plan breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="font-bold text-gray-800 text-[0.9rem]">Plan Distribution</p>
          </div>
          <div className="p-5 space-y-3">
            {(d?.planBreakdown || []).map(p => (
              <div key={p.plan} className="flex items-center gap-3">
                <span className={`text-[0.72rem] font-bold px-2 py-1 rounded-lg w-28 text-center ${planColor[p.plan]}`}>{p.plan}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-indigo-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (p.count / (d?.stats.totalShops || 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-[0.82rem] font-bold text-gray-700 w-8 text-right">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pending Payment Requests ── */}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-orange-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={17} className="text-orange-500" />
            <p className="font-bold text-gray-800 text-[0.9rem]">Pending Payment Requests</p>
          </div>
          {pendingPayments.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-[0.72rem] font-bold px-2.5 py-1 rounded-lg">
              {pendingPayments.length}টি pending
            </span>
          )}
        </div>

        {prLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="px-5 py-8 text-center text-[0.82rem] text-gray-400">কোনো pending payment নেই</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingPayments.map(pr => (
              <div key={pr.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[0.85rem] font-semibold text-gray-800">{pr.shop?.name}</p>
                    <span className="text-[0.68rem] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">{pr.plan}</span>
                    <span className="text-[0.68rem] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">{methodLabel[pr.method]}</span>
                  </div>
                  <p className="text-[0.75rem] text-gray-500 mt-0.5">
                    TrxID: <span className="font-mono font-bold text-gray-700">{pr.trxId}</span>
                    {' · '}৳{Number(pr.amount).toLocaleString()}
                    {' · '}{new Date(pr.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  {pr.shop?.phone && (
                    <p className="text-[0.7rem] text-gray-400">{pr.shop.phone}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approve.mutate(pr.id)}
                    disabled={approve.isPending}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[0.75rem] font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => reject.mutate(pr.id)}
                    disabled={reject.isPending}
                    className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-[0.75rem] font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent shops */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-bold text-gray-800 text-[0.9rem]">সর্বশেষ যোগ দেওয়া দোকান</p>
          <Link to="/superadmin/shops" className="text-[0.75rem] text-indigo-600 font-semibold hover:underline">সব দেখুন →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="text-left px-5 py-3 text-[0.72rem] font-bold text-gray-500 uppercase">দোকানের নাম</th>
                <th className="text-left px-5 py-3 text-[0.72rem] font-bold text-gray-500 uppercase hidden md:table-cell">ফোন</th>
                <th className="text-center px-5 py-3 text-[0.72rem] font-bold text-gray-500 uppercase">Plan</th>
                <th className="text-center px-5 py-3 text-[0.72rem] font-bold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-[0.72rem] font-bold text-gray-500 uppercase hidden lg:table-cell">যোগ দিয়েছে</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(d?.recentShops || []).map(s => {
                const now = new Date();
                const status = !s.isActive ? 'BLOCKED' : s.subscriptionPlan === 'FREE' ? 'TRIAL' : s.subscriptionEndsAt && new Date(s.subscriptionEndsAt) < now ? 'EXPIRED' : 'ACTIVE';
                return (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/superadmin/shops/${s.id}`} className="text-[0.83rem] font-semibold text-gray-800 hover:text-indigo-600">{s.name}</Link>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-[0.78rem] text-gray-500">{s.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-lg ${planColor[s.subscriptionPlan]}`}>{s.subscriptionPlan}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-lg ${statusColor[status]}`}>{status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden lg:table-cell text-[0.75rem] text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
