import { useState } from 'react';
import { Store, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { mockShop } from '../../data/mockData';

export default function Settings() {
  const [form, setForm] = useState({ ...mockShop });
  const [saved, setSaved] = useState(false);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

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

        {saved && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5 text-[0.8rem] text-primary-700 font-medium">
            <CheckCircle size={16} />
            তথ্য সফলভাবে সংরক্ষিত হয়েছে
          </div>
        )}
        <Button onClick={save} variant={saved ? 'success' : 'primary'}>
          পরিবর্তন সংরক্ষণ করুন
        </Button>
      </div>

      {/* System info */}
      <div className="card p-6">
        <p className="font-bold text-gray-800 text-[0.93rem] mb-4 pb-3 border-b border-gray-100">সিস্টেম তথ্য</p>
        <div className="space-y-3">
          {[
            ['সংস্করণ',   'v1.0.0 (Frontend MVP)'],
            ['Frontend',  'React 18 + Vite + Tailwind CSS'],
            ['Backend',   'STEP 2-এ implement হবে (Node.js + Express)'],
            ['Database',  'STEP 2-এ connect হবে (PostgreSQL + Prisma)'],
            ['মালিক',     'Md. Mosharrof Hossain'],
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
