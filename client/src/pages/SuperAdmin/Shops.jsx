import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { superAdminService } from '../../services/superadmin';

const planColor   = { FREE: 'bg-gray-100 text-gray-600', STARTER: 'bg-blue-100 text-blue-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-amber-100 text-amber-700' };
const statusColor = { ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-blue-100 text-blue-600', EXPIRED: 'bg-red-100 text-red-600', BLOCKED: 'bg-gray-100 text-gray-500' };
const statusLabel = { ACTIVE: 'Active', TRIAL: 'Trial', EXPIRED: 'Expired', BLOCKED: 'Blocked' };

const PLANS    = ['', 'FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
const STATUSES = [
  { val: '', label: 'সব Status' },
  { val: 'active',  label: 'Active'   },
  { val: 'trial',   label: 'Trial'    },
  { val: 'expired', label: 'Expired'  },
  { val: 'blocked', label: 'Blocked'  },
];

export default function SAShops() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plan,   setPlan]   = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sa-shops', search, status, plan],
    queryFn: () => superAdminService.getShops({
      search: search || undefined,
      status: status || undefined,
      plan:   plan   || undefined,
    }),
  });

  const shops = data?.data || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-gray-800">সব দোকান</h1>
        <p className="text-[0.78rem] text-gray-400 mt-0.5">মোট {data?.total || 0}টি দোকান নিবন্ধিত</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="দোকানের নাম, ফোন বা email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
          {STATUSES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
        </select>
        <select value={plan} onChange={e => setPlan(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
          {PLANS.map(p => <option key={p} value={p}>{p || 'সব Plan'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase">দোকান</th>
                  <th className="text-left px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase hidden md:table-cell">মালিক</th>
                  <th className="text-center px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase">Plan</th>
                  <th className="text-center px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-center px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase hidden lg:table-cell">Expire</th>
                  <th className="text-center px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase hidden xl:table-cell">Products</th>
                  <th className="text-right px-5 py-3.5 text-[0.72rem] font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shops.map(s => {
                  const expiry = s.subscriptionEndsAt ? new Date(s.subscriptionEndsAt) : null;
                  const daysLeft = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;
                  const owner = s.users?.[0];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                            <Store size={15} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-[0.83rem] font-semibold text-gray-800">{s.name}</p>
                            <p className="text-[0.7rem] text-gray-400">{s.phone || s.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-[0.78rem] font-medium text-gray-700">{owner?.name || '—'}</p>
                        <p className="text-[0.7rem] text-gray-400">{owner?.email || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-lg ${planColor[s.subscriptionPlan]}`}>
                          {s.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-lg ${statusColor[s.computedStatus]}`}>
                          {statusLabel[s.computedStatus]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center hidden lg:table-cell">
                        {expiry ? (
                          <span className={`text-[0.75rem] font-semibold ${daysLeft && daysLeft <= 7 ? 'text-red-500' : 'text-gray-500'}`}>
                            {daysLeft && daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4 text-center hidden xl:table-cell">
                        <span className="text-[0.78rem] text-gray-500">{s._count?.products || 0}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/superadmin/shops/${s.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[0.75rem] font-semibold transition-colors">
                          <Eye size={13} /> দেখুন
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {shops.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Store size={32} className="mb-3 opacity-30" />
                <p className="text-[0.85rem]">কোনো দোকান পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
