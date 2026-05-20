import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { mockSales } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

export default function SaleHistory() {
  const [search, setSearch] = useState('');
  const filtered = mockSales.filter(s =>
    s.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
    s.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container space-y-4 pt-4">
      <h2 className="section-title">বিক্রির ইতিহাস</h2>
      <Input placeholder="Invoice নং বা কাস্টমার নাম..." value={search} onChange={e => setSearch(e.target.value)} prefix={<Search size={15} />} />
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Invoice নং</th>
                <th className="table-th">কাস্টমার</th>
                <th className="table-th hidden md:table-cell">তারিখ</th>
                <th className="table-th text-right">মোট</th>
                <th className="table-th text-right hidden sm:table-cell">বাকি</th>
                <th className="table-th text-center">ধরন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td font-mono text-xs text-primary-600 font-semibold">{s.invoice_no}</td>
                  <td className="table-td">{s.customer}</td>
                  <td className="table-td hidden md:table-cell text-gray-400 text-xs">{s.sale_date}</td>
                  <td className="table-td text-right font-semibold">{formatCurrency(s.total)}</td>
                  <td className="table-td text-right hidden sm:table-cell">
                    {s.due_amount > 0 ? <span className="text-red-500 font-medium">{formatCurrency(s.due_amount)}</span> : <span className="text-green-600">—</span>}
                  </td>
                  <td className="table-td text-center">
                    <Badge variant={s.payment_type === 'CASH' ? 'green' : s.payment_type === 'CREDIT' ? 'red' : 'yellow'}>
                      {s.payment_type === 'CASH' ? 'নগদ' : s.payment_type === 'CREDIT' ? 'বাকি' : 'আংশিক'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
