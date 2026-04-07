import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import CopyButton from '../components/common/CopyButton';
import Alert from '../components/common/Alert';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [stats,  setStats]   = useState({ upcomingCount: 0, totalCount: 0, todayCount: 0 });
  const [calMsg, setCalMsg]  = useState({ type: '', text: '' });
  const [searchParams]       = useSearchParams();

  useEffect(() => {
    api.get('/users/stats').then((r) => setStats(r.data)).catch(() => {});

    const cal = searchParams.get('calendar');
    if (cal === 'connected') {
      setCalMsg({ type: 'success', text: '🎉 Google Calendar connected! Meetings will now sync automatically.' });
      refreshUser();
    } else if (cal === 'error') {
      setCalMsg({ type: 'error', text: 'Failed to connect Google Calendar. Please try again.' });
    }
  }, []);

  const bookingUrl = user ? `${window.location.origin}/book/${user.username}` : '';

  const connectCalendar = async () => {
    try {
      const res = await api.get('/calendar/auth-url');
      window.location.href = res.data.url;
    } catch {
      alert('Could not start Google OAuth. Check your backend config.');
    }
  };

  const disconnectCalendar = async () => {
    if (!confirm('Disconnect Google Calendar?')) return;
    try {
      await api.delete('/calendar/disconnect');
      refreshUser();
    } catch {
      alert('Failed to disconnect.');
    }
  };

  const STAT_CARDS = [
    { label: 'Upcoming',  value: stats.upcomingCount, ring: 'ring-brand-200',   num: 'text-brand-600'   },
    { label: 'Today',     value: stats.todayCount,    ring: 'ring-emerald-200', num: 'text-emerald-600' },
    { label: 'All-time',  value: stats.totalCount,    ring: 'ring-slate-200',   num: 'text-slate-700'   },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, <span className="text-slate-600 font-medium">{user?.name?.split(' ')[0]}</span>!
        </p>
      </div>

      {/* Calendar banner alert */}
      {calMsg.text && (
        <Alert type={calMsg.type} message={calMsg.text} className="mb-6" />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl p-5 ring-1 ${s.ring}`}>
            <div className={`font-display text-4xl font-bold ${s.num}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">
              {s.label} bookings
            </div>
          </div>
        ))}
      </div>

      {/* Booking link */}
      <div className="card p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-lg">
            🔗
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Your booking link</h2>
            <p className="text-sm text-slate-400">Share this so others can book time with you</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <input
            readOnly value={bookingUrl}
            className="input-field bg-slate-50 text-slate-500 text-sm flex-1 min-w-0 cursor-text"
          />
          <div className="flex gap-2 flex-shrink-0">
            <CopyButton text={bookingUrl} />
            <a
              href={bookingUrl} target="_blank" rel="noreferrer"
              className="btn-secondary px-3 text-sm"
            >
              Preview ↗
            </a>
          </div>
        </div>
      </div>

      {/* Calendar integration card */}
      <div className={`card p-6 mb-6 ${user?.googleCalendarConnected ? 'ring-1 ring-emerald-200' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
              user?.googleCalendarConnected ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              📅
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Google Calendar</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {user?.googleCalendarConnected
                  ? '✅ Connected — meetings sync automatically, double bookings prevented'
                  : 'Connect to auto-create events and prevent double-booking'}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            {user?.googleCalendarConnected ? (
              <button onClick={disconnectCalendar} className="btn-danger text-xs px-3 py-2">
                Disconnect
              </button>
            ) : (
              <button onClick={connectCalendar} className="btn-secondary">
                Connect Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            to: '/availability',
            emoji: '⏰',
            title: 'Set availability',
            desc: 'Configure your weekly schedule',
          },
          {
            to: '/bookings',
            emoji: '📋',
            title: 'View bookings',
            desc: 'Manage upcoming meetings',
          },
          {
            to: '/profile',
            emoji: '✏️',
            title: 'Edit profile',
            desc: 'Update your name, bio, and username',
          },
          {
            to: bookingUrl,
            emoji: '👁️',
            title: 'Preview booking page',
            desc: 'See what guests see',
            external: true,
          },
        ].map((item) =>
          item.external ? (
            <a
              key={item.title} href={item.to} target="_blank" rel="noreferrer"
              className="card p-4 flex items-center gap-4 hover:border-brand-200 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </a>
          ) : (
            <Link
              key={item.title} to={item.to}
              className="card p-4 flex items-center gap-4 hover:border-brand-200 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-semibold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
