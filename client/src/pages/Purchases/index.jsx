import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { formatCurrency } from '../../utils/format';

const mockPurchases = [
  { id: 1, invoice_no: 'PUR-001', supplier: 'ABC ট্রেডিং', total: 45000, paid: 45000, due: 0, date: '2026-05-20', items_count: 5 },
  { id: 2, invoice_no: 'PUR-002', supplier: 'রহমান এন্টারপ্রাইজ', total: 28000, paid: 15000, due: 13000, date: '2026-05-18', items_count: 3 },
];

export default function PurchaseList() {
  const [purchases] = useState(mockPurchases);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="page-container space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">ক্রয় ব্যবস্থাপনা</h2>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>নতুন ক্রয়</Button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Invoice নং</th>
                <th className="table-th">সাপ্লায়ার</th>
                <th className="table-th hidden md:table-cell">তারিখ</th>
                <th className="table-th text-right">মোট</th>
                <th className="table-th text-right hidden sm:table-cell">বাকি</th>
                <th className="table-th text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-primary-600 font-semibold">{p.invoice_no}</td>
                  <td className="table-td font-medium">{p.supplier}</td>
                  <td className="table-td hidden md:table-cell text-xs text-gray-400">{p.date}</td>
                  <td className="table-td text-right font-semibold">{formatCurrency(p.total)}</td>
                  <td className="table-td text-right hidden sm:table-cell">
                    {p.due > 0 ? <span className="text-red-500 font-medium">{formatCurrency(p.due)}</span> : <span className="text-green-600">পরিশোধিত</span>}
                  </td>
                  <td className="table-td text-center">
                    <Badge variant={p.due === 0 ? 'green' : 'red'}>{p.due === 0 ? 'সম্পন্ন' : 'বাকি আছে'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="নতুন ক্রয় এন্ট্রি">
        <div className="space-y-3">
          <Input label="সাপ্লায়ারের নাম" required />
          <Input label="Invoice নং" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="মোট পরিমাণ" type="number" prefix="৳" />
            <Input label="পরিশোধিত" type="number" prefix="৳" />
          </div>
          <Input label="তারিখ" type="date" />
          <p className="text-xs text-gray-400">* পণ্য যোগ করলে স্টক স্বয়ংক্রিয়ভাবে বাড়বে</p>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button fullWidth>সংরক্ষণ</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
