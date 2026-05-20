import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { mockProducts, mockCategories } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const initForm = { name: '', sku: '', category: '', purchase_price: '', selling_price: '', current_stock: '', min_stock_alert: '', unit: 'পিস' };

export default function ProductList() {
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initForm);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const f = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const openAdd  = () => { setEditing(null); setForm(initForm); setShowModal(true); };
  const openEdit = p  => { setEditing(p); setForm({ ...p }); setShowModal(true); };
  const handleDelete = id => {
    if (!confirm('এই পণ্যটি মুছে ফেলবেন?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };
  const handleSave = () => {
    if (!form.name) return;
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form, purchase_price: +form.purchase_price, selling_price: +form.selling_price, current_stock: +form.current_stock, min_stock_alert: +form.min_stock_alert } : p));
    } else {
      setProducts(prev => [...prev, { ...form, id: Date.now(), purchase_price: +form.purchase_price, selling_price: +form.selling_price, current_stock: +form.current_stock, min_stock_alert: +form.min_stock_alert }]);
    }
    setShowModal(false);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">পণ্য ও স্টক</h1>
          <p className="page-subtitle mt-0.5">মোট {products.length}টি পণ্য</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openAdd}>নতুন পণ্য</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'মোট পণ্য', value: products.length, color: 'text-gray-800', bg: 'bg-white' },
          { label: 'স্টক ঠিক আছে', value: products.filter(p => p.current_stock > p.min_stock_alert).length, color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'কম স্টক', value: products.filter(p => p.current_stock <= p.min_stock_alert).length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[0.72rem] text-gray-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        prefix={<Search size={15} />}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>পণ্যের নাম</th>
                <th className="hidden sm:table-cell">SKU</th>
                <th className="hidden lg:table-cell">ক্যাটাগরি</th>
                <th className="text-right">ক্রয় মূল্য</th>
                <th className="text-right">বিক্রয় মূল্য</th>
                <th className="text-center">স্টক</th>
                <th className="text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate max-w-[140px]">{p.name}</p>
                        <p className="text-[0.7rem] text-gray-400">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell font-mono text-[0.75rem] text-gray-500">{p.sku}</td>
                  <td className="hidden lg:table-cell">
                    <Badge variant="blue">{p.category}</Badge>
                  </td>
                  <td className="text-right text-gray-600">{formatCurrency(p.purchase_price)}</td>
                  <td className="text-right font-bold text-gray-800">{formatCurrency(p.selling_price)}</td>
                  <td className="text-center">
                    <Badge variant={p.current_stock <= p.min_stock_alert ? 'red' : 'green'}>
                      {p.current_stock} {p.unit}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-blue-50 text-blue-500 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><Package size={28} /></div>
              <p className="text-[0.85rem] font-medium text-gray-500">কোনো পণ্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'}>
        <div className="space-y-4">
          <Input label="পণ্যের নাম" value={form.name} onChange={f('name')} required placeholder="যেমন: সিমেন্ট ৫০কেজি" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU কোড" value={form.sku} onChange={f('sku')} placeholder="CEM-001" />
            <div>
              <label className="form-label">ক্যাটাগরি</label>
              <select className="form-select" value={form.category} onChange={f('category')}>
                <option value="">নির্বাচন করুন</option>
                {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ক্রয় মূল্য" type="number" value={form.purchase_price} onChange={f('purchase_price')} prefix={<span className="text-xs">৳</span>} />
            <Input label="বিক্রয় মূল্য" type="number" value={form.selling_price} onChange={f('selling_price')} prefix={<span className="text-xs">৳</span>} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="বর্তমান স্টক" type="number" value={form.current_stock} onChange={f('current_stock')} />
            <Input label="সর্বনিম্ন সতর্কতা" type="number" value={form.min_stock_alert} onChange={f('min_stock_alert')} />
            <Input label="একক" value={form.unit} onChange={f('unit')} placeholder="পিস" />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={handleSave}>{editing ? 'আপডেট করুন' : 'যোগ করুন'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
