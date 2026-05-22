import { useState } from 'react';
import { Search, Plus, Minus, Trash2, CheckCircle, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { productsService } from '../../services/products';
import { customersService } from '../../services/customers';
import { salesService } from '../../services/sales';
import { formatCurrency } from '../../utils/format';

const PAY_TYPES = [
  { key: 'CASH',    label: 'নগদ' },
  { key: 'CREDIT',  label: 'বাকি' },
  { key: 'PARTIAL', label: 'আংশিক' },
];

export default function POS() {
  const qc = useQueryClient();
  const [search,     setSearch]    = useState('');
  const [cart,       setCart]      = useState([]);
  const [customerId, setCustomerId]= useState('');
  const [payType,    setPayType]   = useState('CASH');
  const [paidAmt,    setPaidAmt]   = useState('');
  const [discount,   setDiscount]  = useState('');
  const [done,       setDone]      = useState(null);
  const [apiError,   setApiError]  = useState('');

  const { data: productData } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsService.getAll({ search: search || undefined, limit: 100 }),
  });

  const { data: customerData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll({ limit: 200 }),
  });

  const products  = (productData?.data || []).slice(0, 12);
  const customers = customerData?.data || [];

  const addToCart = p => {
    if (p.currentStock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex
        ? prev.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.currentStock) } : i)
        : [...prev, { ...p, qty: 1 }];
    });
  };
  const setQty    = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const removeItem= id        => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + Number(i.sellingPrice) * i.qty, 0);
  const disc     = Number(discount) || 0;
  const total    = Math.max(0, subtotal - disc);
  const paid     = payType === 'CASH' ? total : (Number(paidAmt) || 0);
  const due      = Math.max(0, total - paid);

  const selectedCustomer = customers.find(c => c.id === customerId);

  const saleMutation = useMutation({
    mutationFn: salesService.create,
    onSuccess: res => {
      const sale = res.data;
      setDone({
        invoiceNo: sale.invoiceNo,
        customer: selectedCustomer?.name || 'Walk-in',
        items: cart,
        subtotal, disc, total, paid, due,
        payType,
        date: new Date(sale.saleDate).toLocaleDateString('en-GB'),
      });
      setCart([]); setDiscount(''); setPaidAmt(''); setCustomerId(''); setSearch(''); setApiError('');
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['sales-recent'] });
      qc.invalidateQueries({ queryKey: ['customers'] }); // customer totalDue may have changed
    },
    onError: err => setApiError(err.response?.data?.error || 'বিক্রয় সম্পন্ন হয়নি। আবার চেষ্টা করুন।'),
  });

  const completeSale = () => {
    if (!cart.length) return;
    setApiError('');
    const payload = {
      customerId:   customerId || null,
      customerName: selectedCustomer?.name || null,
      discount:     disc,
      paidAmount:   paid,
      paymentType:  payType,
      paymentMethod:'CASH',
      items: cart.map(i => ({
        productId: i.id,
        quantity:  i.qty,
        unitPrice: Number(i.sellingPrice),
        discount:  0,
      })),
    };
    saleMutation.mutate(payload);
  };

  if (done) return (
    <div className="page flex items-center justify-center min-h-[70vh]">
      <div className="card p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={34} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">বিক্রয় সম্পন্ন!</h2>
          <p className="text-[0.8rem] text-gray-400 mt-1">{done.invoiceNo} · {done.date}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2.5">
          {[
            ['কাস্টমার',   done.customer],
            ['মোট মূল্য',  formatCurrency(done.total)],
            ['পরিশোধিত',   formatCurrency(done.paid)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[0.83rem]">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-gray-800">{v}</span>
            </div>
          ))}
          {done.due > 0 && (
            <div className="flex justify-between text-[0.83rem] pt-1 border-t border-gray-200">
              <span className="text-red-500 font-medium">বাকি থাকল</span>
              <span className="font-bold text-red-600">{formatCurrency(done.due)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth size="sm" onClick={() => window.print()}>Invoice Print</Button>
          <Button fullWidth size="sm" onClick={() => setDone(null)}>নতুন বিক্রি</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">বিক্রয় / POS</h1>

      <div className="flex flex-col xl:flex-row gap-5" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Left — product picker */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Input placeholder="পণ্যের নাম বা SKU লিখুন..." value={search}
            onChange={e => setSearch(e.target.value)} prefix={<Search size={15} />} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.currentStock === 0}
                className="card p-3.5 text-left hover:border-primary-300 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center mb-2">
                  <Package size={14} className="text-primary-600" />
                </div>
                <p className="text-[0.78rem] font-semibold text-gray-800 line-clamp-2 leading-snug">{p.name}</p>
                <p className="text-[0.68rem] text-gray-400 mt-0.5">{p.sku}</p>
                <p className="text-[0.88rem] font-bold text-primary-600 mt-1.5">{formatCurrency(Number(p.sellingPrice))}</p>
                <div className="mt-1.5">
                  <Badge variant={p.currentStock > 0 ? 'green' : 'red'}>স্টক: {p.currentStock}</Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — cart */}
        <div className="xl:w-80 2xl:w-96 shrink-0">
          <div className="card overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <div className="bg-primary-600 px-4 py-3 flex items-center justify-between">
              <p className="text-white font-bold text-[0.85rem]">কার্ট</p>
              <span className="bg-white/20 text-white text-[0.75rem] font-bold px-2 py-0.5 rounded-full">{cart.length}টি</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {cart.length === 0 && (
                <div className="empty-state py-10">
                  <div className="empty-icon w-12 h-12"><Package size={22} /></div>
                  <p className="text-[0.8rem] text-gray-400">পণ্য যোগ করুন</p>
                </div>
              )}
              {cart.map(item => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.78rem] font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[0.7rem] text-gray-400">
                      {formatCurrency(Number(item.sellingPrice))} × {item.qty} = <span className="text-gray-700 font-bold">{formatCurrency(Number(item.sellingPrice) * item.qty)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => item.qty > 1 ? setQty(item.id, item.qty - 1) : removeItem(item.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-[0.83rem] font-bold">{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition-colors ml-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-4 py-4 space-y-3">
              <div className="space-y-1.5 text-[0.82rem]">
                <div className="flex justify-between text-gray-500">
                  <span>সাবটোটাল</span><span className="font-semibold text-gray-700">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>ছাড়</span>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                    className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="০" />
                </div>
                <div className="flex justify-between font-bold text-[0.9rem] pt-1 border-t border-gray-100">
                  <span className="text-gray-800">মোট</span>
                  <span className="text-primary-700">{formatCurrency(total)}</span>
                </div>
              </div>

              <select className="form-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">সাধারণ কাস্টমার (Walk-in)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} {Number(c.totalDue) > 0 ? `(বাকি: ৳${Number(c.totalDue).toLocaleString()})` : ''}</option>)}
              </select>

              <div className="grid grid-cols-3 gap-1.5">
                {PAY_TYPES.map(({ key, label }) => (
                  <button key={key} onClick={() => setPayType(key)}
                    className={`py-2 rounded-xl text-[0.78rem] font-semibold transition-colors ${
                      payType === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>{label}</button>
                ))}
              </div>

              {payType === 'PARTIAL' && (
                <Input type="number" placeholder="পরিশোধিত পরিমাণ" value={paidAmt}
                  onChange={e => setPaidAmt(e.target.value)} prefix={<span className="text-xs">৳</span>} />
              )}

              {due > 0 && (
                <div className="bg-red-50 rounded-xl px-3 py-2 flex justify-between text-[0.82rem]">
                  <span className="text-red-500 font-medium">বাকি থাকবে</span>
                  <span className="font-bold text-red-600">{formatCurrency(due)}</span>
                </div>
              )}

              {apiError && (
                <p className="text-[0.75rem] text-red-500 bg-red-50 rounded-xl px-3 py-2">{apiError}</p>
              )}

              <Button fullWidth size="lg" onClick={completeSale}
                disabled={!cart.length || saleMutation.isPending}>
                {saleMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'বিক্রয় সম্পন্ন করুন'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
