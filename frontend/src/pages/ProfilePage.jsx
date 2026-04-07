import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { TIMEZONES } from '../utils/timezone';
import Alert from '../components/common/Alert';
import { initials } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:            user?.name            || '',
    username:        user?.username        || '',
    bio:             user?.bio             || '',
    timezone:        user?.timezone        || 'UTC',
    meetingDuration: user?.meetingDuration || 30,
    bufferTime:      user?.bufferTime      || 0,
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState({ type: '', text: '' });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.put('/users/profile', {
        ...form,
        meetingDuration: Number(form.meetingDuration),
        bufferTime:      Number(form.bufferTime),
      });
      updateUser(res.data.user);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    }
  };

  const bookingUrl = `${window.location.origin}/book/${form.username}`;

  return (
    <DashboardLayout>
      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">Profile</h1>

        {msg.text && <Alert type={msg.type} message={msg.text} className="mb-6" />}

        {/* Preview card */}
        <div className="card p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-display font-bold text-xl flex-shrink-0">
            {initials(form.name || 'U')}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{form.name || 'Your name'}</p>
            <p className="text-sm text-slate-400 truncate">{bookingUrl}</p>
            {form.bio && (
              <p className="text-xs text-slate-400 mt-0.5 truncate italic">{form.bio}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Basic info */}
          <div className="card p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Basic info</h2>

            <div>
              <label className="label">Full name</label>
              <input
                type="text" required
                value={form.name} onChange={set('name')}
                className="input-field"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="label">Username</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-brand-500">
                <span className="inline-flex items-center px-3 text-sm text-slate-400 bg-slate-50 border-r border-slate-200 flex-shrink-0">
                  /book/
                </span>
                <input
                  type="text"
                  value={form.username} onChange={set('username')}
                  className="flex-1 px-3 py-3 text-sm text-slate-900 bg-white focus:outline-none"
                  placeholder="yourname"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Bio
                <span className="ml-1 text-slate-400 font-normal">(shown on your booking page)</span>
              </label>
              <textarea
                rows={3}
                value={form.bio} onChange={set('bio')}
                className="input-field resize-none"
                placeholder="A short description of who you are and what you do…"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="card p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Scheduling settings</h2>

            <div>
              <label className="label">Timezone</label>
              <select value={form.timezone} onChange={set('timezone')} className="input-field bg-white">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Meeting duration</label>
                <select
                  value={form.meetingDuration} onChange={set('meetingDuration')}
                  className="input-field bg-white"
                >
                  {[15, 30, 45, 60, 90].map((d) => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Buffer time</label>
                <select
                  value={form.bufferTime} onChange={set('bufferTime')}
                  className="input-field bg-white"
                >
                  {[0, 5, 10, 15, 30].map((b) => (
                    <option key={b} value={b}>{b === 0 ? 'None' : `${b} min`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
