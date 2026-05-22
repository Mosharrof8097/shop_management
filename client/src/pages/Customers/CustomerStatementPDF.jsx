import { formatCurrency } from '../../utils/format';

export default function CustomerStatementPDF({ customer, transactions, summary, periodLabel, shop }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div
      id="customer-statement-content"
      style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#fff', width: '210mm', padding: '0' }}
    >
      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #166534, #15803d)', padding: '28px 32px', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>{(shop?.name || 'HardwareHub')}</p>
            <p style={{ fontSize: 12, color: '#bbf7d0', marginTop: 3 }}>{(shop?.address || '')}</p>
            <p style={{ fontSize: 12, color: '#bbf7d0' }}>{(shop?.phone || '')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>কাস্টমার স্টেটমেন্ট</p>
            <p style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{periodLabel}</p>
            <p style={{ fontSize: 11, color: '#86efac', marginTop: 4 }}>তৈরি: {today}</p>
          </div>
        </div>
      </div>

      {/* ── Customer Info ── */}
      <div style={{ background: '#f0fdf4', borderBottom: '1px solid #dcfce7', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>কাস্টমার তথ্য</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginTop: 4 }}>{customer.name}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{customer.phone}</p>
          {customer.address && <p style={{ fontSize: 12, color: '#6b7280' }}>{customer.address}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>বর্তমান বাকি</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: summary.closeBalance > 0 ? '#dc2626' : '#16a34a', marginTop: 2 }}>
            {formatCurrency(summary.closeBalance)}
          </p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, padding: '20px 32px' }}>
        {[
          { label: 'মোট বিক্রয়',    value: formatCurrency(summary.totalSale),    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'মোট পরিশোধ',    value: formatCurrency(summary.totalPayment), color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'পূর্বের বাকি',   value: formatCurrency(summary.openBalance),  color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
          { label: 'সর্বশেষ বাকি',  value: formatCurrency(summary.closeBalance), color: summary.closeBalance > 0 ? '#dc2626' : '#15803d', bg: summary.closeBalance > 0 ? '#fef2f2' : '#f0fdf4', border: summary.closeBalance > 0 ? '#fecaca' : '#bbf7d0' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Transaction Table ── */}
      <div style={{ padding: '0 32px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
          লেনদেনের বিস্তারিত ({transactions.length}টি)
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['তারিখ', 'বিবরণ', 'Invoice', 'বিক্রয়', 'পরিশোধ', 'ব্যালেন্স'].map(h => (
                <th key={h} style={{
                  padding: '10px 12px', textAlign: h === 'বিক্রয়' || h === 'পরিশোধ' || h === 'ব্যালেন্স' ? 'right' : 'left',
                  fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5,
                  borderBottom: '2px solid #e5e7eb',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={tx.id} style={{ background: tx.type === 'PAYMENT' ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', fontWeight: 600, color: '#374151' }}>
                  {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                </td>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', color: '#4b5563' }}>{tx.description}</td>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#2563eb' }}>
                  {tx.invoice || '—'}
                </td>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 700, color: tx.debit > 0 ? '#1d4ed8' : '#d1d5db' }}>
                  {tx.debit > 0 ? formatCurrency(tx.debit) : '—'}
                </td>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 700, color: tx.credit > 0 ? '#15803d' : '#d1d5db' }}>
                  {tx.credit > 0 ? formatCurrency(tx.credit) : '—'}
                </td>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 900, color: tx.balance > 0 ? '#dc2626' : '#15803d' }}>
                  {formatCurrency(tx.balance)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f3f4f6', borderTop: '2px solid #d1d5db' }}>
              <td colSpan={3} style={{ padding: '11px 12px', fontWeight: 800, fontSize: 13, color: '#111827' }}>মোট সারসংক্ষেপ</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 900, color: '#1d4ed8', fontSize: 13 }}>{formatCurrency(summary.totalSale)}</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 900, color: '#15803d', fontSize: 13 }}>{formatCurrency(summary.totalPayment)}</td>
              <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 900, color: summary.closeBalance > 0 ? '#dc2626' : '#15803d', fontSize: 13 }}>
                {formatCurrency(summary.closeBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={{ margin: '0 32px 28px', background: '#f0fdf4', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dcfce7' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', margin: 0 }}>
            {summary.closeBalance > 0 ? `বকেয়া পরিমাণ: ${formatCurrency(summary.closeBalance)}` : '✅ কোনো বকেয়া নেই'}
          </p>
          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
            {summary.closeBalance > 0 ? 'অনুগ্রহ করে দ্রুত পরিশোধ করুন' : 'সমস্ত পাওনা পরিশোধিত হয়েছে'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{(shop?.name || 'HardwareHub')}</p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>HardwareHub v1.0</p>
        </div>
      </div>
    </div>
  );
}
