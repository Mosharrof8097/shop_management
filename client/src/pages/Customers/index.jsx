import { useState } from 'react';
import { Plus, Search, Phone, MapPin, CreditCard } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { mockCustomers } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const init = { name: '', phone: '', address: '' };

export default function CustomerList() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(init);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const save = () => {
    if (!form.name) return;
    setCustomers(p => [...p, { ...form, id: Date.now(), total_due: 0 }]);
    setModal(false); setForm(init);
  };

  const totalDue = customers.reduce((s, c) => s + c.total_due, 0);

  return (
    <div className="page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">কাস্টমার</h1>
          <p className="page-subtitle mt-0.5">মোট {customers.length}জন · বাকি {formatCurrency(totalDue)}</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setModal(true)}>নতুন কাস্টমার</Button>
      </div>

      <Input placeholder="নাম বা ফোন নম্বর..." value={search} onChange={e => setSearch(e.target.value)} prefix={<Search size={15} />} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="card p-5 hover:shadow-card-hover transition-shadow">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                <span className="text-primary-700 font-bold text-[1rem]">{c.name[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{c.name}</p>
                <div className="flex items-center gap-1 text-[0.72rem] text-gray-400 mt-0.5">
                  <Phone size={10} />
                  <span>{c.phone}</span>
                </div>
              </div>
              <div className="ml-auto shrink-0">
                <Badge variant={c.total_due > 0 ? 'red' : 'green'}>
                  {c.total_due > 0 ? 'বাকি আছে' : 'পরিষ্কার'}
                </Badge>
              </div>
            </div>

            {c.address && (
              <div className="flex items-start gap-1.5 text-[0.75rem] text-gray-500 mb-3">
                <MapPin size={12} className="shrink-0 mt-0.5" />
                <span>{c.address}</span>
              </div>
            )}

            {c.total_due > 0 && (
              <div className="bg-red-50 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-red-400" />
                  <span className="text-[0.75rem] text-red-500 font-medium">মোট বাকি</span>
                </div>
                <span className="font-extrabold text-red-600 text-[0.9rem]">{formatCurrency(c.total_due)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state mt-8">
          <div className="empty-icon"><Search size={26} /></div>
          <p className="text-[0.85rem] text-gray-400">কোনো কাস্টমার পাওয়া যায়নি</p>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="নতুন কাস্টমার যোগ">
        <div className="space-y-4">
          <Input label="নাম" value={form.name} onChange={f('name')} required placeholder="কাস্টমারের পুরো নাম" />
          <Input label="ফোন নম্বর" value={form.phone} onChange={f('phone')} placeholder="০১৭XX-XXXXXX" />
          <Input label="ঠিকানা" value={form.address} onChange={f('address')} placeholder="এলাকা ও শহর" />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={save}>যোগ করুন</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
