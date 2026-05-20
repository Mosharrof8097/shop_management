import { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { mockShop } from '../../data/mockData';

export default function Settings() {
  const [form, setForm] = useState({ ...mockShop });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container space-y-6 pt-4 max-w-2xl">
      <h2 className="section-title">সেটিংস</h2>

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">দোকানের তথ্য</h3>
        <Input label="দোকানের নাম" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="ঠিকানা" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        <Input label="ফোন নম্বর" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <Input label="ইমেইল" value={form.email} type="email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <Button onClick={handleSave} variant={saved ? 'success' : 'primary'}>
          {saved ? '✅ সংরক্ষিত হয়েছে' : 'পরিবর্তন সংরক্ষণ'}
        </Button>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mb-4">সিস্টেম তথ্য</h3>
        <div className="space-y-2 text-sm">
          {[['সংস্করণ', 'v1.0.0 (MVP)'], ['Backend', 'STEP 2-এ implement হবে'], ['Database', 'STEP 2-এ connect হবে']].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-700">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
