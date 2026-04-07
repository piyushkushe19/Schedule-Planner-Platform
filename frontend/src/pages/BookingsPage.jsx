import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/timezone';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';

const FILTERS = [
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'confirmed', label: 'All confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsPage() {
  const { user }              = useAuth();
  const [bookings, setBookings]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [filter,   setFilter]     = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);

  const load = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    const params =
      filter === 'upcoming'
        ? { from: now, status: 'confirmed' }
        : { status: filter };
    try {
      const res = await getMyBookings(params);
      setBookings(res.data.bookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? The guest will be notified via Google Calendar.')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      load();
    } catch {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const tz = user?.timezone || 'UTC';

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Bookings</h1>
            <p className="text-slate-400 mt-1">Manage your scheduled meetings</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${filter === f.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📅"
              title={filter === 'upcoming' ? 'No upcoming meetings' : `No ${filter} bookings`}
              description={
                filter === 'upcoming'
                  ? "Share your booking link so people can schedule time with you."
                  : undefined
              }
              action={
                filter === 'upcoming' && (
                  <Link to="/dashboard" className="btn-primary px-6 py-2.5 text-sm">
                    Go to dashboard
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="card p-4 flex items-center gap-4 hover:ring-1 hover:ring-brand-100 transition-all"
              >
                {/* Status bar */}
                <div
                  className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                    b.status === 'confirmed' ? 'bg-brand-500' : 'bg-slate-200'
                  }`}
                />

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0 uppercase">
                  {b.guestName?.[0] || '?'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{b.guestName}</span>
                    <span
                      className={
                        b.status === 'confirmed' ? 'badge-success' : 'badge-muted'
                      }
                    >
                      {b.status}
                    </span>
                    {b.googleEventId && (
                      <span className="badge-success">📅 Synced</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{b.guestEmail}</p>
                  <p className="text-sm font-medium text-brand-600 mt-1">
                    {formatDateTime(b.startTime, tz)}
                  </p>
                  {b.notes && (
                    <p className="text-xs text-slate-400 mt-1 italic truncate">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                {/* Cancel action */}
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={cancelling === b._id}
                    className="btn-danger text-xs px-3 py-2 flex-shrink-0"
                  >
                    {cancelling === b._id ? '…' : 'Cancel'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
