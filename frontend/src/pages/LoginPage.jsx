import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/common/Alert';

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/dashboard';

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="block font-display text-2xl font-bold text-brand-600 text-center mb-8"
        >
          Schedulr
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-7">Sign in to manage your schedule</p>

          <Alert type="error" message={error} className="mb-5" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required autoComplete="email"
                value={form.email} onChange={set('email')}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password" required autoComplete="current-password"
                value={form.password} onChange={set('password')}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          No account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
