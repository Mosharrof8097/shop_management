import { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { mockProducts, mockCustomers } from '../../data/mockData';
import { formatCurrency, genInvoiceNo } from '../../utils/format';

export default function POS() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [paymentType, setPaymentType] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [completed, setCompleted] = useState(null);

  const filtered = search.length > 0
    ? mockProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    : mockProducts.slice(0, 8);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch('');
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    );
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.selling_price * i.qty, 0);
  const total = subtotal - discount;
  const paid = paymentType === 'CASH' ? total : Number(paidAmount) || 0;
  const due = Math.max(0, total - paid);

  const completeSale = () => {
    if (cart.length === 0) return;
    const invoice = {
      invoice_no: genInvoiceNo(),
      customer: customer || 'সাধারণ কাস্টমার',
      items: cart,
      subtotal, discount, total, paid, due,
      payment_type: paymentType,
      date: new Date().toLocaleDateString('en-GB'),
    };
    setCompleted(invoice);
    setCart([]);
    setDiscount(0);
    setPaidAmount('');
    setCustomer('');
    setSearch('');
  };

  if (completed) {
    return (
      <div className="page-container pt-4 max-w-lg mx-auto space-y-4">
        <div className="card p-6 text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">বিক্রি সম্পন্ন!</h2>
          <p className="text-sm text-gray-500">{completed.invoice_no}</p>
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">মোট</span><span className="font-semibold">{formatCurrency(completed.total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">পরিশোধ</span><span className="font-semibold text-green-600">{formatCurrency(completed.paid)}</span></div>
            {completed.due > 0 && <div className="flex justify-between"><span className="text-gray-500">বাকি</span><span className="font-semibold text-red-500">{formatCurrency(completed.due)}</span></div>}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth icon={<Printer size={15} />} onClick={() => window.print()}>Invoice Print</Button>
            <Button fullWidth onClick={() => setCompleted(null)}>নতুন বিক্রি</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
      <h2 className="section-title">POS — বিক্রি করুন</h2>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: product search */}
        <div className="flex-1 space-y-3">
          <Input
            placeholder="পণ্যের নাম বা SKU লিখুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<Search size={15} />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.current_stock === 0}
                className="card p-3 text-left hover:border-primary-300 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.sku}</p>
                <p className="text-sm font-bold text-primary-600 mt-1">{formatCurrency(p.selling_price)}</p>
                <Badge variant={p.current_stock > 0 ? 'green' : 'red'} className="mt-1 text-xs">
                  স্টক: {p.current_stock}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Right: cart */}
        <div className="lg:w-80 xl:w-96 space-y-3">
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
              <ShoppingCart size={16} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">কার্ট ({cart.length}টি)</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {cart.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">পণ্য যোগ করুন</p>
              )}
              {cart.map(item => (
                <div key={item.id} className="px-4 py-2.5 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(item.selling_price)} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Minus size={11} /></button>
                    <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200"><Plus size={11} /></button>
                  </div>
                  <span className="text-xs font-bold text-gray-800 w-16 text-right">{formatCurrency(item.selling_price * item.qty)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            {/* Totals & payment */}
            <div className="px-4 py-3 bg-gray-50 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">সাবটোটাল</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">ছাড়</span>
                <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)}
                  className="w-24 text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2">
                <span>মোট</span>
                <span className="text-primary-600">{formatCurrency(total)}</span>
              </div>

              {/* Customer & payment type */}
              <select className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none"
                value={customer} onChange={e => setCustomer(e.target.value)}>
                <option value="">সাধারণ কাস্টমার</option>
                {mockCustomers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <div className="flex gap-2">
                {['CASH', 'CREDIT', 'PARTIAL'].map(type => (
                  <button key={type}
                    onClick={() => setPaymentType(type)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${paymentType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {type === 'CASH' ? 'নগদ' : type === 'CREDIT' ? 'বাকি' : 'আংশিক'}
                  </button>
                ))}
              </div>

              {paymentType === 'PARTIAL' && (
                <Input type="number" placeholder="পরিশোধিত পরিমাণ"
                  value={paidAmount} onChange={e => setPaidAmount(e.target.value)} prefix="৳" />
              )}

              {due > 0 && (
                <div className="flex justify-between text-sm text-red-500 font-medium">
                  <span>বাকি থাকবে</span>
                  <span>{formatCurrency(due)}</span>
                </div>
              )}

              <Button fullWidth size="lg" onClick={completeSale} disabled={cart.length === 0}>
                বিক্রি সম্পন্ন করুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
