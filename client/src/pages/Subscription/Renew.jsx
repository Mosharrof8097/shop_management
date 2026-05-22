import { useState } from 'react';
import { RefreshCw, Phone, CreditCard, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const PLANS = [
  { key: 'STARTER',      label: 'STARTER',      price: '৳৪৯৯', features: 'সব feature, ১ user' },
  { key: 'PROFESSIONAL', label: 'PROFESSIONAL',  price: '৳৯৯৯', features: 'সব feature, ৫ user' },
];
const METHODS = [
  { key: 'BKASH', label: 'bKash' },
  { key: 'NAGAD', label: 'Nagad' },
];

const fmtDate = d => d
  ? new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
  : '—';

export default function SubscriptionRenew() {
  const { user, logout } = useAuth();

  const [plan,    setPlan]    = useState('STARTER');
  const [method,  setMethod]  = useState('BKASH');
  const [trxId,   setTrxId]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!trxId.trim()) return setError('Transaction ID (TrxID) দিন');
    setLoading(true); setError('');
    try {
      await api.post('/subscription/request', { trxId: trxId.trim(), method, plan, months: 1 });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submit ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-sidebar flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[480px] space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-orange-900/40">
            <RefreshCw size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Subscription নবায়ন করুন</h1>
          {user?.shop && (
            <p className="text-orange-300 text-[0.82rem] mt-1">
              {user.shop.name} — মেয়াদ শেষ: {fmtDate(user.shop.subscriptionEndsAt)}
            </p>
          )}
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={34} className="text-green-600" />
            </div>
            <h2 className="text-[1.1rem] font-extrabold text-gray-800">Request পাঠানো হয়েছে!</h2>
            <p className="text-[0.82rem] text-gray-500">
              Admin আপনার TrxID verify করবেন এবং ২৪ ঘণ্টার মধ্যে subscription চালু করবেন।
            </p>
            <div className="bg-blue-50 rounded-2xl p-3 text-[0.78rem] text-blue-700">
              TrxID: <strong>{trxId}</strong>
            </div>
            <button onClick={logout}
              className="w-full text-[0.75rem] text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 py-1">
              <LogOut size={13} /> লগআউট করুন
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="bg-white rounded-3xl shadow-2xl p-7 space-y-5">

            {/* Step 1: Payment info */}
            <div>
              <p className="text-[0.72rem] font-bold text-gray-400 uppercase tracking-wider mb-3">ধাপ ১ — Payment করুন</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[0.78rem] text-yellow-700">
                  <CreditCard size={13} />
                  <span><strong>bKash / Nagad:</strong> 01863-656870 (Send Money)</span>
                </div>
                <div className="text-[0.73rem] text-yellow-600 space-y-1">
                  <p>• STARTER ১ মাস = <strong>৳৪৯৯</strong></p>
                  <p>• PROFESSIONAL ১ মাস = <strong>৳৯৯৯</strong></p>
                </div>
              </div>
            </div>

            {/* Step 2: Submit TrxID */}
            <form onSubmit={submit} className="space-y-4">
              <p className="text-[0.72rem] font-bold text-gray-400 uppercase tracking-wider">ধাপ ২ — TrxID ও Plan জানান</p>

              {/* Plan select */}
              <div>
                <label className="form-label">Plan বেছে নিন</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLANS.map(p => (
                    <button key={p.key} type="button" onClick={() => setPlan(p.key)}
                      className={`border-2 rounded-2xl p-3 text-left transition-all ${
                        plan === p.key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}>
                      <p className="font-bold text-[0.82rem] text-gray-800">{p.label}</p>
                      <p className="text-primary-600 font-extrabold text-[0.9rem]">{p.price}/মাস</p>
                      <p className="text-[0.68rem] text-gray-400">{p.features}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method select */}
              <div>
                <label className="form-label">Payment Method</label>
                <div className="flex gap-2">
                  {METHODS.map(m => (
                    <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                      className={`flex-1 py-2 rounded-xl text-[0.8rem] font-semibold border-2 transition-all ${
                        method === m.key
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-500 hover:border-primary-300'
                      }`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TrxID input */}
              <div>
                <label className="form-label">Transaction ID (TrxID)</label>
                <input
                  type="text" value={trxId} onChange={e => setTrxId(e.target.value)}
                  className="form-input font-mono tracking-wider"
                  placeholder="যেমন: 8K2J0XXXXX (bKash SMS থেকে)"
                />
                <p className="text-[0.7rem] text-gray-400 mt-1">bKash SMS-এ "TrxID" বলে একটি code আসে — সেটি লিখুন</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-[0.78rem] text-red-600 flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-lg btn-primary w-full disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submit হচ্ছে...</>
                  : 'Payment Request পাঠান'}
              </button>
            </form>

            <button onClick={logout}
              className="w-full flex items-center justify-center gap-1.5 text-[0.75rem] text-gray-400 hover:text-gray-600 transition-colors py-1">
              <LogOut size={13} /> লগআউট করুন
            </button>
          </div>
        )}

        <p className="text-center text-[0.73rem] text-primary-400">
          © 2026 HardwareHub · Md. Mosharrof Hossain
        </p>
      </div>
    </div>
  );
}
