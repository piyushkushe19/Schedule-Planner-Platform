import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { detectTimezone, TIMEZONES } from '../utils/timezone';
import Alert from '../components/common/Alert';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    timezone: detectTimezone(),
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.timezone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm mb-7">
            Start scheduling in minutes — free forever
          </p>

          <Alert type="error" message={error} className="mb-5" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text" required autoComplete="name"
                value={form.name} onChange={set('name')}
                className="input-field" placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email" required autoComplete="email"
                value={form.email} onChange={set('email')}
                className="input-field" placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password" required autoComplete="new-password" minLength={6}
                value={form.password} onChange={set('password')}
                className="input-field" placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label className="label">Your timezone</label>
              <select
                value={form.timezone} onChange={set('timezone')}
                className="input-field bg-white"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-5">
            By signing up you agree to our Terms of Service.
          </p>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
