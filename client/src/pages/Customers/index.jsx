import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, MapPin, CreditCard, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { customersService } from '../../services/customers';
import { formatCurrency } from '../../utils/format';

const init = { name: '', phone: '', address: '' };
const PAGE_LIMIT = 20;

export default function CustomerList() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(init);
  const [apiError, setApiError] = useState('');

  const handleSearch = val => { setSearch(val); setPage(1); };

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => customersService.getAll({ search: search || undefined, page, limit: PAGE_LIMIT }),
  });

  const createMutation = useMutation({
    mutationFn: customersService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'], exact: false });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setModal(false); setForm(init); setApiError('');
    },
    onError: err => setApiError(err.response?.data?.error || 'সমস্যা হয়েছে'),
  });

  const customers = data?.data || [];
  const totalDue  = customers.reduce((s, c) => s + Number(c.totalDue), 0);
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    if (!form.name) return;
    createMutation.mutate(form);
  };

  return (
    <div className="page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">কাস্টমার</h1>
          <p className="page-subtitle mt-0.5">মোট {customers.length}জন · বাকি {formatCurrency(totalDue)}</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => { setModal(true); setApiError(''); }}>নতুন কাস্টমার</Button>
      </div>

      <Input placeholder="নাম বা ফোন নম্বর..." value={search}
        onChange={e => handleSearch(e.target.value)} prefix={<Search size={15} />} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map(c => (
            <div key={c.id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary-700 font-bold text-[1rem]">{c.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{c.name}</p>
                  {c.phone && (
                    <div className="flex items-center gap-1 text-[0.72rem] text-gray-400 mt-0.5">
                      <Phone size={10} /><span>{c.phone}</span>
                    </div>
                  )}
                </div>
                <div className="ml-auto shrink-0">
                  <Badge variant={Number(c.totalDue) > 0 ? 'red' : 'green'}>
                    {Number(c.totalDue) > 0 ? 'বাকি আছে' : 'পরিষ্কার'}
                  </Badge>
                </div>
              </div>

              {c.address && (
                <div className="flex items-start gap-1.5 text-[0.75rem] text-gray-500 mb-3">
                  <MapPin size={12} className="shrink-0 mt-0.5" /><span>{c.address}</span>
                </div>
              )}

              {Number(c.totalDue) > 0 && (
                <div className="bg-red-50 rounded-xl px-3.5 py-2.5 flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-red-400" />
                    <span className="text-[0.75rem] text-red-500 font-medium">মোট বাকি</span>
                  </div>
                  <span className="font-extrabold text-red-600 text-[0.9rem]">{formatCurrency(Number(c.totalDue))}</span>
                </div>
              )}

              <Link to={`/customers/${c.id}/ledger`}>
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-primary-200 text-primary-700 text-[0.78rem] font-semibold hover:bg-primary-50 transition-colors">
                  <FileText size={13} />লেজার ও স্টেটমেন্ট দেখুন
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoading && customers.length === 0 && (
        <div className="empty-state mt-8">
          <div className="empty-icon"><Search size={26} /></div>
          <p className="text-[0.85rem] text-gray-400">কোনো কাস্টমার পাওয়া যায়নি</p>
        </div>
      )}

      {data?.total > PAGE_LIMIT && (
        <Pagination
          page={page}
          totalPages={Math.ceil((data?.total || 0) / PAGE_LIMIT)}
          total={data?.total || 0}
          limit={PAGE_LIMIT}
          onPageChange={setPage}
        />
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="নতুন কাস্টমার যোগ">
        <div className="space-y-4">
          <Input label="নাম" value={form.name} onChange={f('name')} required placeholder="কাস্টমারের পুরো নাম" />
          <Input label="ফোন নম্বর" value={form.phone} onChange={f('phone')} placeholder="০১৭XX-XXXXXX" />
          <Input label="ঠিকানা" value={form.address} onChange={f('address')} placeholder="এলাকা ও শহর" />
          {apiError && <p className="text-[0.78rem] text-red-500 bg-red-50 rounded-xl px-3 py-2">{apiError}</p>}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setModal(false)}>বাতিল</Button>
            <Button fullWidth onClick={save} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'যোগ করুন'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
