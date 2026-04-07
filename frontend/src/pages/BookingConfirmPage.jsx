import { useLocation, Link } from 'react-router-dom';
import { formatDateTime, detectTimezone } from '../utils/timezone';

export default function BookingConfirmPage() {
  const { state } = useLocation();
  const tz = detectTimezone();

  if (!state?.booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-3">🤔</div>
          <p className="text-slate-500 mb-4">No booking information found.</p>
          <Link to="/" className="text-brand-600 font-semibold hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  const { booking, host } = state;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">

          {/* Green header */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-10 text-center text-white">
            <div className="
              w-20 h-20 rounded-full
              bg-white/25 border-4 border-white/40
              flex items-center justify-center mx-auto mb-5
              text-4xl
            ">
              ✓
            </div>
            <h1 className="font-display text-2xl font-bold mb-1">You're booked!</h1>
            <p className="text-white/65 text-sm">
              A confirmation has been sent to <strong>{booking.guestName?.split(' ')[0]}</strong>'s email
            </p>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="space-y-1 mb-6">
              {[
                { label: 'Meeting with', value: host?.name },
                { label: 'Duration',     value: `${booking.duration} minutes` },
                { label: 'When',         value: formatDateTime(booking.startTime, tz) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0 gap-4"
                >
                  <span className="text-sm text-slate-400 flex-shrink-0">{row.label}</span>
                  <span className="text-sm font-semibold text-slate-900 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <Link
              to="/"
              className="btn-primary w-full py-3 text-base text-center block"
            >
              Done
            </Link>

            <p className="text-center text-xs text-slate-400 mt-4">
              Need to cancel?{' '}
              <span className="text-brand-500">
                A cancel link is included in your confirmation email.
              </span>
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center text-xs text-slate-300 mt-6">
          Scheduled via{' '}
          <Link to="/" className="text-brand-400 hover:underline font-semibold">Schedulr</Link>
        </p>
      </div>
    </div>
  );
}
