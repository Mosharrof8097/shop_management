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

  const openAdd = () => { setEditing(null); setForm(initForm); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setShowModal(true); };

  const handleSave = () => {
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
    } else {
      setProducts(prev => [...prev, { ...form, id: Date.now(), purchase_price: +form.purchase_price, selling_price: +form.selling_price, current_stock: +form.current_stock, min_stock_alert: +form.min_stock_alert }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('এই পণ্যটি মুছে ফেলবেন?')) setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="page-container space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">পণ্য ও স্টক</h2>
        <Button icon={<Plus size={16} />} onClick={openAdd}>নতুন পণ্য</Button>
      </div>

      {/* Search */}
      <Input
        placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        prefix={<Search size={15} />}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">মোট পণ্য</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{products.filter(p => p.current_stock > p.min_stock_alert).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">স্টক ঠিক আছে</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{products.filter(p => p.current_stock <= p.min_stock_alert).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">কম স্টক</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">পণ্যের নাম</th>
                <th className="table-th">SKU</th>
                <th className="table-th hidden md:table-cell">ক্যাটাগরি</th>
                <th className="table-th text-right">বিক্রয় মূল্য</th>
                <th className="table-th text-center">স্টক</th>
                <th className="table-th text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="table-td hidden md:table-cell">
                    <Badge variant="blue">{p.category}</Badge>
                  </td>
                  <td className="table-td text-right font-semibold">{formatCurrency(p.selling_price)}</td>
                  <td className="table-td text-center">
                    <Badge variant={p.current_stock <= p.min_stock_alert ? 'red' : 'green'}>
                      {p.current_stock} {p.unit}
                    </Badge>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">কোনো পণ্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'} size="md">
        <div className="space-y-3">
          <Input label="পণ্যের নাম" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            <div>
              <label className="form-label">ক্যাটাগরি</label>
              <select className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">নির্বাচন করুন</option>
                {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ক্রয় মূল্য" type="number" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} prefix="৳" />
            <Input label="বিক্রয় মূল্য" type="number" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: e.target.value }))} prefix="৳" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="বর্তমান স্টক" type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} />
            <Input label="সর্বনিম্ন স্টক" type="number" value={form.min_stock_alert} onChange={e => setForm(f => ({ ...f, min_stock_alert: e.target.value }))} />
            <Input label="একক" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={handleSave}>সংরক্ষণ</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
