import { useState, useEffect } from 'react';
import { Store, Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { shopsService } from '../../services/shops';
import { useAuth } from '../../hooks/useAuth';

const PLAN_LABEL = { FREE: 'Free Trial', STARTER: 'Starter', PROFESSIONAL: 'Professional', ENTERPRISE: 'Enterprise' };

export default function Settings() {
  const { user, login } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['shop-me'],
    queryFn: shopsService.getMe,
  });

  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' });

  useEffect(() => {
    const shop = data?.data;
    if (shop) setForm({ name: shop.name || '', address: shop.address || '', phone: shop.phone || '', email: shop.email || '' });
  }, [data]);

  const f = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const { mutate: save, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: () => shopsService.updateMe(form),
    onSuccess: res => {
      qc.invalidateQueries({ queryKey: ['shop-me'] });
      // Sync user state + localStorage so Navbar re-renders with new shop name
      if (user && res.data) {
        const token = localStorage.getItem('hw_token');
        const updated = { ...user, shop: { ...user.shop, ...res.data } };
        login(updated, token);
      }
    },
  });

  const shop = data?.data;

  if (isLoading) return (
    <div className="page flex items-center justify-center min-h-[40vh]">
      <Loader2 size={24} className="animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="page max-w-2xl">
      <h1 className="page-title">সেটিংস</h1>

      {/* Shop info card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Store size={18} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-[0.93rem]">দোকানের তথ্য</p>
            <p className="text-[0.73rem] text-gray-400">Invoice-এ এই তথ্য দেখাবে</p>
          </div>
        </div>

        <Input
          label="দোকানের নাম" value={form.name} onChange={f('name')}
          prefix={<Store size={14} />} required
        />
        <Input
          label="ঠিকানা" value={form.address} onChange={f('address')}
          prefix={<MapPin size={14} />}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="ফোন নম্বর" value={form.phone} onChange={f('phone')}
            prefix={<Phone size={14} />}
          />
          <Input
            label="ইমেইল" type="email" value={form.email} onChange={f('email')}
            prefix={<Mail size={14} />}
          />
        </div>

        {isSuccess && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 text-[0.8rem] text-primary-700 font-medium">
            <CheckCircle size={16} />
            তথ্য সফলভাবে সংরক্ষিত হয়েছে
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-[0.78rem] text-red-600">
            {error?.response?.data?.error || 'সংরক্ষণ ব্যর্থ হয়েছে।'}
          </div>
        )}

        <Button onClick={() => save()} disabled={isPending} variant={isSuccess ? 'success' : 'primary'}>
          {isPending ? <><Loader2 size={14} className="animate-spin" />সংরক্ষণ হচ্ছে...</> : 'পরিবর্তন সংরক্ষণ করুন'}
        </Button>
      </div>

      {/* System info */}
      <div className="card p-6">
        <p className="font-bold text-gray-800 text-[0.93rem] mb-4 pb-3 border-b border-gray-100">সিস্টেম তথ্য</p>
        <div className="space-y-3">
          {[
            ['দোকানের নাম',    shop?.name || '—'],
            ['Subscription',   PLAN_LABEL[shop?.subscriptionPlan] || '—'],
            ['মেয়াদ শেষ',      shop?.subscriptionEndsAt ? new Date(shop.subscriptionEndsAt).toLocaleDateString('en-GB') : '—'],
            ['Currency',       shop?.currency || 'BDT'],
            ['সংস্করণ',        'v1.0.0'],
            ['মালিক',          'Md. Mosharrof Hossain'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 gap-4">
              <span className="text-[0.8rem] text-gray-500 font-medium shrink-0">{k}</span>
              <span className="text-[0.8rem] text-gray-700 font-semibold text-right truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
