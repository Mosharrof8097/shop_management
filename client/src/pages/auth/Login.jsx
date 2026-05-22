import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { authService } from '../../services/auth';

export default function Login({ onLogin, isSuperAdmin = false }) {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: isSuperAdmin ? 'superadmin@hardwarehub.com' : 'admin@hardwarehub.com', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      await onLogin(res.user, res.token);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.subscriptionExpired) {
        navigate('/subscription/renew');
        return;
      }
      setError(err.response?.data?.error || 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-sidebar flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[400px] space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-900/50">
            <Leaf size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">HardwareHub</h1>
          <p className="text-primary-300 text-[0.82rem] mt-1">
            {isSuperAdmin ? 'Super Admin Panel' : 'হার্ডওয়্যার দোকান ম্যানেজমেন্ট সিস্টেম'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-7 space-y-5">
          <div>
            <h2 className="text-[1rem] font-bold text-gray-800">আপনার অ্যাকাউন্টে লগইন করুন</h2>
            <p className="text-[0.75rem] text-gray-400 mt-0.5">Demo password: admin123</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label">ইমেইল অ্যাড্রেস</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={15} />
                </div>
                <input
                  type="email" value={form.email} required
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="form-input pl-9"
                  placeholder="admin@hardwarehub.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">পাসওয়ার্ড</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'} value={form.password} required
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="form-input pl-9 pr-10"
                  placeholder="পাসওয়ার্ড লিখুন"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-[0.78rem] text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-lg btn-primary w-full mt-1 disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />লগইন হচ্ছে...</>
                : 'লগইন করুন'
              }
            </button>
          </form>
        </div>

        {!isSuperAdmin && (
          <p className="text-center text-[0.73rem] text-primary-300">
            নতুন দোকান?{' '}
            <Link to="/register" className="text-primary-200 font-medium hover:text-white underline underline-offset-2">
              ফ্রি ট্রায়াল শুরু করুন
            </Link>
          </p>
        )}

        <p className="text-center text-[0.73rem] text-primary-400">
          © 2026 HardwareHub · Md. Mosharrof Hossain
        </p>
      </div>
    </div>
  );
}
