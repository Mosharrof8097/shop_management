import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { purchasesService } from '../../services/purchases';
import { productsService } from '../../services/products';
import { formatCurrency } from '../../utils/format';

const emptyItem = { productId: '', quantity: '', unitCost: '' };

export default function PurchaseList() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo]   = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems]             = useState([{ ...emptyItem }]);
  const [apiError, setApiError]       = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => purchasesService.getAll({ limit: 100 }),
  });

  const { data: supplierData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: purchasesService.getSuppliers,
  });

  const { data: productData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsService.getAll({ limit: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: purchasesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowModal(false); resetForm(); setApiError('');
    },
    onError: err => setApiError(err.response?.data?.error || 'সমস্যা হয়েছে'),
  });

  const purchases  = data?.data || [];
  const suppliers  = supplierData?.data || [];
  const products   = productData?.data || [];

  const resetForm = () => { setSupplierId(''); setInvoiceNo(''); setPaidAmount(''); setItems([{ ...emptyItem }]); setPurchaseDate(new Date().toISOString().split('T')[0]); };

  const updateItem = (idx, key, val) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const addItem    = () => setItems(prev => [...prev, { ...emptyItem }]);
  const removeItem = idx => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitCost) || 0), 0);

  const handleSave = () => {
    const validItems = items.filter(it => it.productId && it.quantity && it.unitCost);
    if (!validItems.length) return setApiError('অন্তত একটি পণ্য যোগ করুন');
    createMutation.mutate({
      supplierId: supplierId || null,
      invoiceNo:  invoiceNo  || null,
      purchaseDate,
      paidAmount: Number(paidAmount) || 0,
      items: validItems.map(it => ({ productId: it.productId, quantity: Number(it.quantity), unitCost: Number(it.unitCost) })),
    });
  };

  return (
    <div className="page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">ক্রয় ব্যবস্থাপনা</h1>
          <p className="page-subtitle mt-0.5">মোট {purchases.length}টি ক্রয়</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => { setShowModal(true); setApiError(''); }}>নতুন ক্রয়</Button>
      </div>

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
                  <th>Invoice নং</th>
                  <th>সাপ্লায়ার</th>
                  <th className="hidden md:table-cell">তারিখ</th>
                  <th className="text-right">মোট</th>
                  <th className="text-right hidden sm:table-cell">বাকি</th>
                  <th className="text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs text-primary-600 font-semibold">{p.invoiceNo || '—'}</td>
                    <td className="font-medium">{p.supplier?.name || '—'}</td>
                    <td className="hidden md:table-cell text-xs text-gray-400">
                      {new Date(p.purchaseDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="text-right font-semibold">{formatCurrency(Number(p.total))}</td>
                    <td className="text-right hidden sm:table-cell">
                      {Number(p.dueAmount) > 0
                        ? <span className="text-red-500 font-medium">{formatCurrency(Number(p.dueAmount))}</span>
                        : <span className="text-green-600">পরিশোধিত</span>}
                    </td>
                    <td className="text-center">
                      <Badge variant={Number(p.dueAmount) === 0 ? 'green' : p.status === 'PARTIAL' ? 'yellow' : 'red'}>
                        {Number(p.dueAmount) === 0 ? 'সম্পন্ন' : 'বাকি আছে'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {purchases.length === 0 && (
              <div className="empty-state">
                <p className="text-[0.85rem] text-gray-400">কোনো ক্রয় নেই</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="নতুন ক্রয় এন্ট্রি">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">সাপ্লায়ার</label>
              <select className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                <option value="">সাপ্লায়ার বাছুন</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Input label="Invoice নং" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="PUR-001" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="তারিখ" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
            <Input label="পরিশোধিত" type="number" value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)} prefix={<span className="text-xs">৳</span>} />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">পণ্যসমূহ</label>
              <button onClick={addItem} className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:underline">
                <Plus size={12} /> পণ্য যোগ
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-10 gap-2 items-end">
                  <div className="col-span-5">
                    <select className="form-select" value={item.productId}
                      onChange={e => updateItem(idx, 'productId', e.target.value)}>
                      <option value="">পণ্য বাছুন</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" placeholder="পরিমাণ" value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      className="form-input text-center" />
                  </div>
                  <div className="col-span-2">
                    <input type="number" placeholder="দাম" value={item.unitCost}
                      onChange={e => updateItem(idx, 'unitCost', e.target.value)}
                      className="form-input text-right" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Package size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {subtotal > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex justify-between text-[0.83rem]">
              <span className="text-gray-500">মোট পরিমাণ</span>
              <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
          )}

          <p className="text-xs text-gray-400">* পণ্য যোগ করলে স্টক স্বয়ংক্রিয়ভাবে বাড়বে</p>

          {apiError && <p className="text-[0.78rem] text-red-500 bg-red-50 rounded-xl px-3 py-2">{apiError}</p>}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
