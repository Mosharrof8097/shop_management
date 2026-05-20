import { useState } from 'react';
import { Plus, Search, User, Phone } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { mockCustomers } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const initForm = { name: '', phone: '', address: '' };

export default function CustomerList() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSave = () => {
    setCustomers(prev => [...prev, { ...form, id: Date.now(), total_due: 0 }]);
    setShowModal(false);
    setForm(initForm);
  };

  return (
    <div className="page-container space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">কাস্টমার</h2>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>নতুন কাস্টমার</Button>
      </div>
      <Input placeholder="নাম বা ফোন নম্বর..." value={search} onChange={e => setSearch(e.target.value)} prefix={<Search size={15} />} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(c => (
          <div key={c.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Phone size={11} />
                    <span>{c.phone}</span>
                  </div>
                </div>
              </div>
              <Badge variant={c.total_due > 0 ? 'red' : 'green'}>
                {c.total_due > 0 ? 'বাকি আছে' : 'পরিষ্কার'}
              </Badge>
            </div>
            {c.address && <p className="text-xs text-gray-400 mt-2">{c.address}</p>}
            {c.total_due > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">মোট বাকি</span>
                <span className="text-sm font-bold text-red-500">{formatCurrency(c.total_due)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="নতুন কাস্টমার">
        <div className="space-y-3">
          <Input label="নাম" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="ফোন নম্বর" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="ঠিকানা" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={handleSave}>সংরক্ষণ</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
