import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import { salesService } from '../../services/sales';
import { formatCurrency } from '../../utils/format';

const payLabel   = { CASH: 'নগদ', CREDIT: 'বাকি', PARTIAL: 'আংশিক' };
const payVariant = { CASH: 'green', CREDIT: 'red', PARTIAL: 'yellow' };
const PAGE_LIMIT = 20;

export default function SaleHistory() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const handleSearch = val => { setSearch(val); setPage(1); };

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page],
    queryFn: () => salesService.getAll({ page, limit: PAGE_LIMIT }),
  });

  const sales = data?.data || [];
  const total = data?.total || 0;

  // Client-side search within current page
  const filtered = search
    ? sales.filter(s =>
        s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        (s.customer?.name || s.customerName || '').toLowerCase().includes(search.toLowerCase())
      )
    : sales;

  return (
    <div className="page">
      <div>
        <h1 className="page-title">বিক্রির ইতিহাস</h1>
        <p className="page-subtitle mt-0.5">মোট {total}টি বিক্রয়</p>
      </div>

      <Input placeholder="Invoice নং বা কাস্টমার নাম..." value={search}
        onChange={e => handleSearch(e.target.value)} prefix={<Search size={15} />} />

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
                  <th>কাস্টমার</th>
                  <th className="hidden md:table-cell">তারিখ</th>
                  <th className="text-right">মোট</th>
                  <th className="text-right hidden sm:table-cell">বাকি</th>
                  <th className="text-center">ধরন</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs text-primary-600 font-semibold">{s.invoiceNo}</td>
                    <td>{s.customer?.name || s.customerName || 'Walk-in'}</td>
                    <td className="hidden md:table-cell text-gray-400 text-xs">
                      {new Date(s.saleDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="text-right font-semibold">{formatCurrency(Number(s.total))}</td>
                    <td className="text-right hidden sm:table-cell">
                      {Number(s.dueAmount) > 0
                        ? <span className="text-red-500 font-medium">{formatCurrency(Number(s.dueAmount))}</span>
                        : <span className="text-green-600">—</span>}
                    </td>
                    <td className="text-center">
                      <Badge variant={payVariant[s.paymentType]}>{payLabel[s.paymentType]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state">
                <p className="text-[0.85rem] text-gray-400">কোনো বিক্রয় পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        )}
        {total > PAGE_LIMIT && (
          <div className="px-4 pb-3 border-t border-gray-50 mt-1">
            <Pagination
              page={page}
              totalPages={Math.ceil(total / PAGE_LIMIT)}
              total={total}
              limit={PAGE_LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
