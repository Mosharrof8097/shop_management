import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, Shield, ShieldOff, Calendar, Package, Users, ShoppingCart, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminService } from '../../services/superadmin';

const planColor  = { FREE: 'bg-gray-100 text-gray-600', STARTER: 'bg-blue-100 text-blue-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-amber-100 text-amber-700' };
const PLANS      = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
const PLAN_PRICE = { FREE: 0, STARTER: 499, PROFESSIONAL: 999, ENTERPRISE: 2999 };

export default function SAShopDetail() {
  const { id }  = useParams();
  const qc      = useQueryClient();

  const [subPlan,   setSubPlan]   = useState('STARTER');
  const [subMonths, setSubMonths] = useState(1);
  const [toast,     setToast]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sa-shop', id],
    queryFn:  () => superAdminService.getShop(id),
  });

  // Cleanup toast timeout on unmount/change to prevent memory leak
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (msg) => setToast(msg);

  const blockMutation = useMutation({
    mutationFn: () => superAdminService.blockShop(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-shop', id] }); qc.invalidateQueries({ queryKey: ['sa-shops'] }); showToast('দোকান block করা হয়েছে'); },
  });

  const unblockMutation = useMutation({
    mutationFn: () => superAdminService.unblockShop(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-shop', id] }); qc.invalidateQueries({ queryKey: ['sa-shops'] }); showToast('দোকান unblock করা হয়েছে'); },
  });

  const subMutation = useMutation({
    mutationFn: () => superAdminService.updateSubscription(id, { plan: subPlan, months: subMonths }),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['sa-shop', id] }); qc.invalidateQueries({ queryKey: ['sa-shops'] }); showToast(res.message || 'Subscription updated'); },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const shop   = data?.data;
  const now    = new Date();
  const expiry = shop?.subscriptionEndsAt ? new Date(shop.subscriptionEndsAt) : null;
  const daysLeft = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : null;
  const owner  = shop?.users?.find(u => u.role === 'ADMIN');

  const statusBadge = !shop?.isActive
    ? { label: 'BLOCKED',  cls: 'bg-gray-200 text-gray-600' }
    : shop?.computedStatus === 'EXPIRED'
    ? { label: 'EXPIRED',  cls: 'bg-red-100 text-red-600' }
    : shop?.subscriptionPlan === 'FREE'
    ? { label: 'TRIAL',    cls: 'bg-blue-100 text-blue-600' }
    : { label: 'ACTIVE',   cls: 'bg-green-100 text-green-700' };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-[0.83rem] font-semibold animate-bounce">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/superadmin/shops">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-gray-800">{shop?.name}</h1>
            <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-lg ${statusBadge.cls}`}>{statusBadge.label}</span>
          </div>
          <p className="text-[0.75rem] text-gray-400 mt-0.5">যোগ দিয়েছে: {shop?.createdAt ? new Date(shop.createdAt).toLocaleDateString('en-GB') : '—'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Shop Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <p className="font-bold text-gray-700 flex items-center gap-2"><Store size={16} className="text-indigo-500" /> দোকানের তথ্য</p>
          {[
            ['নাম',      shop?.name],
            ['ঠিকানা',   shop?.address || '—'],
            ['ফোন',      shop?.phone || '—'],
            ['Email',    shop?.email || '—'],
            ['Currency', shop?.currency || 'BDT'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[0.82rem] border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-500 font-medium">{k}</span>
              <span className="font-semibold text-gray-700 text-right max-w-[55%] truncate">{v}</span>
            </div>
          ))}
        </div>

        {/* Owner + Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <p className="font-bold text-gray-700 flex items-center gap-2"><Users size={16} className="text-indigo-500" /> মালিকের তথ্য</p>
            {[
              ['নাম',   owner?.name  || '—'],
              ['Email', owner?.email || '—'],
              ['Last Login', owner?.lastLoginAt ? new Date(owner.lastLoginAt).toLocaleDateString('en-GB') : 'কখনো না'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[0.82rem] border-b border-gray-50 pb-2 last:border-0">
                <span className="text-gray-500 font-medium">{k}</span>
                <span className="font-semibold text-gray-700">{v}</span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Package size={16}/>, label: 'Products', val: shop?._count?.products || 0 },
              { icon: <Users size={16}/>,   label: 'Customers', val: shop?._count?.customers || 0 },
              { icon: <ShoppingCart size={16}/>, label: 'Sales', val: shop?._count?.sales || 0 },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <span className="text-indigo-500 flex justify-center mb-1">{s.icon}</span>
                <p className="text-lg font-extrabold text-gray-800">{s.val}</p>
                <p className="text-[0.68rem] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
        <p className="font-bold text-gray-700 flex items-center gap-2"><Calendar size={16} className="text-indigo-500" /> Subscription Management</p>

        {/* Current status */}
        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[0.7rem] text-gray-400 font-medium uppercase">Current Plan</p>
            <span className={`text-[0.78rem] font-bold px-2 py-1 rounded-lg mt-1 inline-block ${planColor[shop?.subscriptionPlan]}`}>{shop?.subscriptionPlan}</span>
          </div>
          <div>
            <p className="text-[0.7rem] text-gray-400 font-medium uppercase">Expires</p>
            <p className="text-[0.82rem] font-bold text-gray-700 mt-1">{expiry ? expiry.toLocaleDateString('en-GB') : '—'}</p>
          </div>
          <div>
            <p className="text-[0.7rem] text-gray-400 font-medium uppercase">Days Left</p>
            <p className={`text-[0.82rem] font-bold mt-1 ${daysLeft && daysLeft <= 7 ? 'text-red-500' : daysLeft && daysLeft > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {daysLeft && daysLeft > 0 ? `${daysLeft} দিন` : 'Expired'}
            </p>
          </div>
        </div>

        {/* Subscription form */}
        <div className="border border-indigo-100 rounded-xl p-4 space-y-4 bg-indigo-50/30">
          <p className="text-[0.82rem] font-bold text-gray-700">Subscription Update করুন</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.72rem] font-bold text-gray-500 uppercase mb-1.5">Plan বাছুন</label>
              <select value={subPlan} onChange={e => setSubPlan(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                {PLANS.map(p => (
                  <option key={p} value={p}>{p} — ৳{PLAN_PRICE[p]}/মাস</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.72rem] font-bold text-gray-500 uppercase mb-1.5">কত মাস?</label>
              <select value={subMonths} onChange={e => setSubMonths(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                {[1,2,3,6,12].map(m => <option key={m} value={m}>{m} মাস {m === 12 ? '(১ বছর)' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-100">
            <span className="text-[0.78rem] text-gray-500">মোট মূল্য</span>
            <span className="font-bold text-indigo-700">৳{(PLAN_PRICE[subPlan] * subMonths).toLocaleString()}</span>
          </div>
          <button onClick={() => subMutation.mutate()} disabled={subMutation.isPending}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[0.83rem] font-bold transition-colors disabled:opacity-60">
            {subMutation.isPending ? 'Updating...' : 'Subscription Activate করুন'}
          </button>
        </div>
      </div>

      {/* Block / Unblock */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Shield size={16} className="text-red-400" /> Access Control</p>
        <div className="flex gap-3">
          {shop?.isActive ? (
            <button onClick={() => { if (confirm(`"${shop.name}" দোকানটি block করবেন?`)) blockMutation.mutate(); }}
              disabled={blockMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[0.82rem] font-bold transition-colors disabled:opacity-60">
              <ShieldOff size={15} /> {blockMutation.isPending ? 'Blocking...' : 'দোকান Block করুন'}
            </button>
          ) : (
            <button onClick={() => unblockMutation.mutate()} disabled={unblockMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-[0.82rem] font-bold transition-colors disabled:opacity-60">
              <Shield size={15} /> {unblockMutation.isPending ? 'Unblocking...' : 'দোকান Unblock করুন'}
            </button>
          )}
        </div>
        {!shop?.isActive && (
          <p className="text-[0.75rem] text-red-400 mt-2">এই দোকানটি বর্তমানে blocked — মালিক login করতে পারছেন না।</p>
        )}
      </div>
    </div>
  );
}
