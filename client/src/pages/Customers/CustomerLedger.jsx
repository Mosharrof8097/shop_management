import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import CustomerStatementPDF from './CustomerStatementPDF';
import { customersService } from '../../services/customers';
import { formatCurrency } from '../../utils/format';
import { exportElementAsPDF } from '../../utils/pdf';
import { useAuth } from '../../hooks/useAuth';

const MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const YEARS  = ['2026', '2025', '2024'];

export default function CustomerLedger() {
  const { id } = useParams();
  const { user } = useAuth();

  const [filterType, setFilterType] = useState('all');
  const [selMonth,   setSelMonth]   = useState(new Date().getMonth());
  const [selYear,    setSelYear]    = useState(String(new Date().getFullYear()));
  const [exporting,  setExporting]  = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['customer-ledger', id],
    queryFn: () => customersService.getLedger(id),
  });

  const customer    = data?.customer;
  const allTx       = data?.data || [];
  const summary_api = data?.summary || {};

  const filtered = useMemo(() => {
    if (filterType === 'all') return allTx;
    return allTx.filter(t => {
      const d = new Date(t.date);
      if (filterType === 'yearly')  return String(d.getFullYear()) === selYear;
      if (filterType === 'monthly') return String(d.getFullYear()) === selYear && d.getMonth() === selMonth;
      return true;
    });
  }, [allTx, filterType, selYear, selMonth]);

  const summary = useMemo(() => ({
    totalSale:    filtered.filter(t => t.type === 'SALE').reduce((s, t)    => s + Number(t.debit), 0),
    totalPayment: filtered.filter(t => t.type === 'PAYMENT').reduce((s, t) => s + Number(t.credit), 0),
    closeBalance: filtered.length ? Number(filtered[filtered.length - 1].runningBalance) : 0,
  }), [filtered]);

  const handlePDF = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 120));
    const label = filterType === 'monthly' ? `${MONTHS[selMonth]}-${selYear}`
                : filterType === 'yearly'  ? selYear : 'সম্পূর্ণ';
    await exportElementAsPDF('customer-statement-content', `লেজার-${customer?.name}-${label}.pdf`);
    setExporting(false);
  };

  if (isLoading) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!customer) return (
    <div className="page">
      <p className="text-gray-400">কাস্টমার পাওয়া যায়নি</p>
      <Link to="/customers"><Button variant="secondary" icon={<ArrowLeft size={14} />}>ফিরে যান</Button></Link>
    </div>
  );

  const periodLabel = filterType === 'all' ? 'সম্পূর্ণ লেনদেন'
    : filterType === 'yearly'  ? `${selYear} সালের লেনদেন`
    : `${MONTHS[selMonth]} ${selYear}`;

  return (
    <div className="page">
      <div className="flex items-center gap-3">
        <Link to="/customers">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="page-title">{customer.name} — লেজার</h1>
          <p className="page-subtitle mt-0.5">{customer.phone} · {customer.address}</p>
        </div>
        <Button
          icon={exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          onClick={handlePDF} disabled={exporting || !filtered.length}>
          {exporting ? 'তৈরি হচ্ছে...' : 'PDF স্টেটমেন্ট'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'মোট বিক্রয়',   value: formatCurrency(summary.totalSale),              icon: <TrendingUp size={20}/>,  iconBg: 'bg-blue-100',    iconColor: 'text-blue-600'    },
          { label: 'মোট পরিশোধ',   value: formatCurrency(summary.totalPayment),            icon: <TrendingDown size={20}/>,iconBg: 'bg-primary-100', iconColor: 'text-primary-600' },
          { label: 'মোট বাকি (DB)', value: formatCurrency(Number(summary_api.closingBalance||0)), icon: <Wallet size={20}/>,  iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'বর্তমান বাকি',  value: formatCurrency(summary.closeBalance),            icon: <CreditCard size={20}/>, iconBg: summary.closeBalance > 0 ? 'bg-red-100' : 'bg-primary-100', iconColor: summary.closeBalance > 0 ? 'text-red-600' : 'text-primary-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.iconBg}`}><span className={s.iconColor}>{s.icon}</span></div>
            <div className="min-w-0">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value text-lg">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[['all','সব'], ['monthly','মাসিক'], ['yearly','বার্ষিক']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${
                filterType === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>{l}</button>
          ))}
        </div>

        {(filterType === 'yearly' || filterType === 'monthly') && (
          <select className="form-select w-28" value={selYear} onChange={e => setSelYear(e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y} সাল</option>)}
          </select>
        )}

        {filterType === 'monthly' && (
          <select className="form-select w-36" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}

        <span className="ml-auto text-[0.78rem] text-gray-400 font-medium">
          {filtered.length}টি লেনদেন · {periodLabel}
        </span>
      </div>

      {/* Transactions table */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-[0.85rem]">এই সময়ের কোনো লেনদেন নেই</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th className="hidden sm:table-cell">Invoice</th>
                  <th className="text-right text-blue-600">বিক্রয় (ডেবিট)</th>
                  <th className="text-right text-primary-600">পরিশোধ (ক্রেডিট)</th>
                  <th className="text-right">বাকি ব্যালেন্স</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className={tx.type === 'PAYMENT' ? 'bg-primary-50/20' : ''}>
                    <td className="whitespace-nowrap">
                      <p className="text-[0.8rem] font-semibold text-gray-700">
                        {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'SALE' ? 'bg-blue-100' : 'bg-primary-100'
                        }`}>
                          {tx.type === 'SALE'
                            ? <TrendingUp size={12} className="text-blue-600" />
                            : <TrendingDown size={12} className="text-primary-600" />}
                        </div>
                        <span className="text-[0.8rem] text-gray-700">{tx.description}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      {tx.invoiceNo
                        ? <span className="font-mono text-[0.72rem] text-blue-600 font-semibold">{tx.invoiceNo}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right">
                      {Number(tx.debit) > 0
                        ? <span className="font-bold text-blue-700">{formatCurrency(Number(tx.debit))}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right">
                      {Number(tx.credit) > 0
                        ? <span className="font-bold text-primary-700">{formatCurrency(Number(tx.credit))}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right">
                      <span className={`font-extrabold text-[0.83rem] ${Number(tx.runningBalance) > 0 ? 'text-red-600' : 'text-primary-600'}`}>
                        {formatCurrency(Number(tx.runningBalance))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={3} className="px-4 py-3 font-bold text-gray-700 text-[0.83rem]">মোট</td>
                  <td className="px-4 py-3 text-right font-extrabold text-blue-700">{formatCurrency(summary.totalSale)}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-primary-700">{formatCurrency(summary.totalPayment)}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-red-600">{formatCurrency(summary.closeBalance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div className="sr-only">
        <CustomerStatementPDF customer={customer} transactions={filtered} summary={summary} periodLabel={periodLabel} shop={user?.shop} />
      </div>
    </div>
  );
}
