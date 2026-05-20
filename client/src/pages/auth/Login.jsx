import { useState } from 'react';
import { Wrench, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@hardwarehub.com', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Mock auth — STEP 4-এ real API দিয়ে replace হবে
    if (form.password === 'admin123') {
      onLogin({ name: 'Admin', email: form.email, role: 'ADMIN' });
    } else {
      setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wrench size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">HardwareHub</h1>
          <p className="text-slate-400 text-sm mt-1">দোকান ম্যানেজমেন্ট সিস্টেম</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center">লগইন করুন</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="ইমেইল"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <div className="relative">
              <Input
                label="পাসওয়ার্ড"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 bottom-2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
            </Button>
          </form>
          <p className="text-xs text-center text-gray-400 pt-1">
            Demo: password = <code className="bg-gray-100 px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
