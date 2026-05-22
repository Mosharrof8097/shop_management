import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Lock, Mail, Store, User, Phone } from 'lucide-react';
import { authService } from '../../services/auth';

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ shopName: '', ownerName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('পাসওয়ার্ড মিলছে না।');
    if (!agreed) return setError('শর্তে সম্মত হতে হবে।');
    if (form.password.length < 6) return setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।');
    setLoading(true);
    try {
      const res = await authService.register({
        shopName: form.shopName,
        ownerName: form.ownerName,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });
      await onLogin(res.user, res.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-sidebar flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[440px] space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-900/50">
            <Leaf size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">HardwareHub</h1>
          <p className="text-primary-300 text-[0.82rem] mt-1">নতুন দোকান রেজিস্ট্রেশন — ১৪ দিন বিনামূল্যে</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-7 space-y-5">
          <div>
            <h2 className="text-[1rem] font-bold text-gray-800">আপনার দোকান খুলুন</h2>
            <p className="text-[0.75rem] text-gray-400 mt-0.5">১৪ দিনের ফ্রি ট্রায়াল, কোনো কার্ড লাগবে না</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Shop Name */}
            <div>
              <label className="form-label">দোকানের নাম</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Store size={15} /></div>
                <input type="text" value={form.shopName} required onChange={set('shopName')}
                  className="form-input pl-9" placeholder="যেমন: মেসার্স হাসান ট্রেডার্স" />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="form-label">মালিকের নাম</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><User size={15} /></div>
                <input type="text" value={form.ownerName} required onChange={set('ownerName')}
                  className="form-input pl-9" placeholder="আপনার পুরো নাম" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">মোবাইল নম্বর</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Phone size={15} /></div>
                <input type="tel" value={form.phone} required onChange={set('phone')}
                  className="form-input pl-9" placeholder="01XXXXXXXXX" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">ইমেইল</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Mail size={15} /></div>
                <input type="email" value={form.email} required onChange={set('email')}
                  className="form-input pl-9" placeholder="email@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">পাসওয়ার্ড</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Lock size={15} /></div>
                <input type={showPw ? 'text' : 'password'} value={form.password} required onChange={set('password')}
                  className="form-input pl-9 pr-10" placeholder="কমপক্ষে ৬ অক্ষর" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Lock size={15} /></div>
                <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} required onChange={set('confirmPassword')}
                  className="form-input pl-9" placeholder="পাসওয়ার্ড আবার লিখুন" />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer" />
              <span className="text-[0.75rem] text-gray-500">
                আমি HardwareHub-এর{' '}
                <span className="text-primary-600 font-medium">শর্তাবলী</span> এবং{' '}
                <span className="text-primary-600 font-medium">গোপনীয়তা নীতিতে</span> সম্মত
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-[0.78rem] text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-lg btn-primary w-full mt-1 disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />রেজিস্ট্রেশন হচ্ছে...</>
                : 'ফ্রি ট্রায়াল শুরু করুন'}
            </button>
          </form>

          <p className="text-center text-[0.75rem] text-gray-400">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">লগইন করুন</Link>
          </p>
        </div>

        <p className="text-center text-[0.73rem] text-primary-400">
          © 2026 HardwareHub · Md. Mosharrof Hossain
        </p>
      </div>
    </div>
  );
}
