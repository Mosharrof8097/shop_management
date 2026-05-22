import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import { productsService } from '../../services/products';
import { formatCurrency } from '../../utils/format';

const PAGE_LIMIT = 20;

const initForm = { name: '', sku: '', categoryId: '', purchasePrice: '', sellingPrice: '', currentStock: '', minStockAlert: '5', unit: 'পিস' };

export default function ProductList() {
  const qc = useQueryClient();
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(initForm);
  const [apiError,  setApiError]  = useState('');

  // Reset to page 1 when search changes
  const handleSearch = val => { setSearch(val); setPage(1); };

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, page],
    queryFn: () => productsService.getAll({ search: search || undefined, page, limit: PAGE_LIMIT }),
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: productsService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'], exact: false }); setShowModal(false); setApiError(''); },
    onError: err => setApiError(err.response?.data?.error || 'সমস্যা হয়েছে'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'], exact: false }); setShowModal(false); setApiError(''); },
    onError: err => setApiError(err.response?.data?.error || 'সমস্যা হয়েছে'),
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'], exact: false }),
    onError: err => setApiError(err.response?.data?.error || 'পণ্য মুছতে ব্যর্থ হয়েছে।'),
  });

  const products = data?.data || [];
  const categories = catData?.data || [];

  const f = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const openAdd  = () => { setEditing(null); setForm(initForm); setApiError(''); setShowModal(true); };
  const openEdit = p  => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku || '', categoryId: p.categoryId || '',
      purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      currentStock: p.currentStock, minStockAlert: p.minStockAlert, unit: p.unit,
    });
    setApiError('');
    setShowModal(true);
  };

  const handleDelete = id => {
    if (!confirm('এই পণ্যটি মুছে ফেলবেন?')) return;
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!form.name) { setApiError('পণ্যের নাম দিন।'); return; }
    const payload = {
      name: form.name,
      sku: form.sku || null,
      categoryId: form.categoryId || null,
      purchasePrice: Number(form.purchasePrice),
      sellingPrice:  Number(form.sellingPrice),
      currentStock:  Number(form.currentStock) || 0,
      minStockAlert: Number(form.minStockAlert) || 5,
      unit: form.unit || 'পিস',
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="page">
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
          { label: 'মোট পণ্য',    value: products.length,                                               color: 'text-gray-800',    bg: 'bg-white' },
          { label: 'স্টক ঠিক আছে', value: products.filter(p => p.currentStock > p.minStockAlert).length, color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'কম স্টক',      value: products.filter(p => p.currentStock <= p.minStockAlert).length, color: 'text-red-600',     bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[0.72rem] text-gray-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <Input placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..." value={search}
        onChange={e => handleSearch(e.target.value)} prefix={<Search size={15} />} />

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="empty-state py-12">
            <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
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
                {products.map(p => (
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
                    <td className="hidden sm:table-cell font-mono text-[0.75rem] text-gray-500">{p.sku || '—'}</td>
                    <td className="hidden lg:table-cell">
                      <Badge variant="blue">{p.category?.name || '—'}</Badge>
                    </td>
                    <td className="text-right text-gray-600">{formatCurrency(Number(p.purchasePrice))}</td>
                    <td className="text-right font-bold text-gray-800">{formatCurrency(Number(p.sellingPrice))}</td>
                    <td className="text-center">
                      <Badge variant={p.currentStock <= p.minStockAlert ? 'red' : 'green'}>
                        {p.currentStock} {p.unit}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-blue-50 text-blue-500 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400 transition-colors disabled:opacity-40">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon"><Package size={28} /></div>
                <p className="text-[0.85rem] font-medium text-gray-500">কোনো পণ্য পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        )}
        {data?.total > PAGE_LIMIT && (
          <div className="px-4 pb-3 border-t border-gray-50 mt-1">
            <Pagination
              page={page}
              totalPages={Math.ceil((data?.total || 0) / PAGE_LIMIT)}
              total={data?.total || 0}
              limit={PAGE_LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'}>
        <div className="space-y-4">
          <Input label="পণ্যের নাম" value={form.name} onChange={f('name')} required placeholder="যেমন: সিমেন্ট ৫০কেজি" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU কোড (ঐচ্ছিক)" value={form.sku} onChange={f('sku')} placeholder="যেমন: CEM-001" />
            <div>
              <label className="form-label">ক্যাটাগরি</label>
              <select className="form-select" value={form.categoryId} onChange={f('categoryId')}>
                <option value="">ক্যাটাগরি বাছুন</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ক্রয় মূল্য" type="number" value={form.purchasePrice} onChange={f('purchasePrice')} prefix={<span className="text-xs">৳</span>} />
            <Input label="বিক্রয় মূল্য" type="number" value={form.sellingPrice} onChange={f('sellingPrice')} prefix={<span className="text-xs">৳</span>} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="বর্তমান স্টক" type="number" value={form.currentStock} onChange={f('currentStock')} />
            <Input label="সর্বনিম্ন সতর্কতা" type="number" value={form.minStockAlert} onChange={f('minStockAlert')} />
            <Input label="একক" value={form.unit} onChange={f('unit')} placeholder="পিস" />
          </div>
          {apiError && <p className="text-[0.78rem] text-red-500 bg-red-50 rounded-xl px-3 py-2">{apiError}</p>}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : editing ? 'আপডেট করুন' : 'যোগ করুন'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
