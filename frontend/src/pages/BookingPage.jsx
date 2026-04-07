import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addDays, startOfToday, isSameDay, toISODate,
  fmtMonthYear, fmtMonthDay, fmtDayNum,
  fmtWeekdayLong, fmtShortDate,
} from '../utils/helpers';
import { getAvailableSlots, createBooking } from '../services/bookingService';
import { formatSlot, detectTimezone } from '../utils/timezone';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';

const guestTz = detectTimezone();

export default function BookingPage() {
  const { username } = useParams();
  const navigate     = useNavigate();

  const [host,         setHost]         = useState(null);
  const [notFound,     setNotFound]     = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [aiSlots,      setAiSlots]      = useState([]);
  const [form, setForm] = useState({ guestName: '', guestEmail: '', notes: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [error,      setError]          = useState('');

  const DATES = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    api.get(`/users/${username}`)
      .then((r) => setHost(r.data.user))
      .catch(() => setNotFound(true));
  }, [username]);

  const loadSlots = useCallback(async (date) => {
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    setAiSlots([]);
    try {
      const res = await getAvailableSlots(username, toISODate(date), guestTz);
      setSlots(res.data.slots);
      if (res.data.slots.length > 1) {
        api.post('/ai/suggest-times', {
          availableSlots: res.data.slots,
          guestTimezone: guestTz,
        })
          .then((r) => setAiSlots(r.data.suggestions || []))
          .catch(() => {});
      }
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await createBooking(username, {
        ...form,
        startTime:     selectedSlot.start,
        guestTimezone: guestTz,
      });
      navigate('/booking-confirmed', { state: { booking: res.data.booking, host } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAiSlot    = (slot) => aiSlots.some((s) => s.slot === slot.start);
  const getAiReason = (slot) => aiSlots.find((s) => s.slot === slot.start)?.reason || '';

  const amSlots = slots.filter((s) => new Date(s.start).getUTCHours() < 12);
  const pmSlots = slots.filter((s) => new Date(s.start).getUTCHours() >= 12);

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Page not found</h2>
          <p className="text-slate-400">The booking page <strong>@{username}</strong> doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Host banner */}
      <div className="bg-gradient-to-br from-brand-800 via-brand-700 to-violet-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center font-display font-bold text-2xl flex-shrink-0">
              {host.name[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{host.name}</h1>
              {host.bio && <p className="text-white/60 text-sm mt-0.5 max-w-md">{host.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-white/45 text-xs">
                <span>🕐 {host.meetingDuration} min meeting</span>
                <span>·</span>
                <span>🌍 Shown in {guestTz.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — date + slots */}
          <div className="lg:col-span-3 space-y-5">

            {/* Date picker */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-900 mb-1 text-sm">Select a date</h2>
              <p className="text-xs text-slate-400 mb-4">
                {fmtMonthYear(DATES[0])} — {fmtMonthDay(DATES[DATES.length - 1])}
              </p>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                  <div key={d} className="text-center text-xs text-slate-300 font-medium py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: DATES[0].getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {DATES.map((d, i) => {
                  const isSelected = selectedDate && isSameDay(d, selectedDate);
                  const isToday    = isSameDay(d, new Date());
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      className={`
                        aspect-square flex items-center justify-center
                        rounded-xl text-sm font-medium transition-all duration-150
                        ${isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'hover:bg-brand-50 hover:text-brand-700 text-slate-600'}
                        ${isToday && !isSelected ? 'ring-2 ring-brand-300 ring-offset-1' : ''}
                      `}
                    >
                      {fmtDayNum(d)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="card p-5 animate-fade-in">
                <h2 className="font-semibold text-slate-900">{fmtWeekdayLong(selectedDate)}</h2>
                <p className="text-xs text-slate-400 mb-4 mt-0.5">
                  All times in {guestTz.replace(/_/g, ' ')}
                </p>

                {slotsLoading ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">😔</div>
                    <p className="text-slate-400 text-sm">No available slots on this day</p>
                    <p className="text-slate-300 text-xs mt-1">Try selecting a different date</p>
                  </div>
                ) : (
                  <>
                    {/* AI suggestions */}
                    {aiSlots.length > 0 && (
                      <div className="mb-5 p-3.5 bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200 rounded-xl">
                        <p className="text-xs font-semibold text-brand-700 mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full inline-block" />
                          AI-recommended times
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aiSlots.map((s, i) => {
                            const slot = slots.find((sl) => sl.start === s.slot);
                            if (!slot) return null;
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedSlot(slot)}
                                title={s.reason}
                                className="text-xs px-3 py-1.5 font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                              >
                                {formatSlot(s.slot, guestTz)}
                              </button>
                            );
                          })}
                        </div>
                        {aiSlots[0]?.reason && (
                          <p className="text-xs text-brand-400 mt-2">{aiSlots[0].reason}</p>
                        )}
                      </div>
                    )}

                    {/* AM slots */}
                    {amSlots.length > 0 && (
                      <>
                        <p className="text-xs text-slate-400 font-medium mb-2">Morning</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                          {amSlots.map((slot, i) => {
                            const isSelected  = selectedSlot?.start === slot.start;
                            const isSuggested = isAiSlot(slot);
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedSlot(slot)}
                                title={isSuggested ? getAiReason(slot) : undefined}
                                className={`
                                  py-2.5 px-2 rounded-xl text-sm font-medium border
                                  transition-all relative
                                  ${isSelected
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                    : isSuggested
                                    ? 'border-brand-300 text-brand-700 bg-brand-50 hover:bg-brand-100'
                                    : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700'}
                                `}
                              >
                                {formatSlot(slot.start, guestTz)}
                                {isSuggested && !isSelected && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* PM slots */}
                    {pmSlots.length > 0 && (
                      <>
                        <p className="text-xs text-slate-400 font-medium mb-2">Afternoon</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {pmSlots.map((slot, i) => {
                            const isSelected  = selectedSlot?.start === slot.start;
                            const isSuggested = isAiSlot(slot);
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedSlot(slot)}
                                title={isSuggested ? getAiReason(slot) : undefined}
                                className={`
                                  py-2.5 px-2 rounded-xl text-sm font-medium border
                                  transition-all relative
                                  ${isSelected
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                    : isSuggested
                                    ? 'border-brand-300 text-brand-700 bg-brand-50 hover:bg-brand-100'
                                    : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700'}
                                `}
                              >
                                {formatSlot(slot.start, guestTz)}
                                {isSuggested && !isSelected && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {!selectedDate && (
              <div className="card p-8 text-center text-slate-400">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-sm">Select a date above to see available times</p>
              </div>
            )}
          </div>

          {/* Right — booking form */}
          <div className="lg:col-span-2">
            <div className="card p-5 lg:sticky lg:top-6">
              <h2 className="font-semibold text-slate-900 mb-4">Your details</h2>

              {selectedSlot ? (
                <div className="mb-5 p-4 bg-brand-50 border border-brand-200 rounded-xl">
                  <p className="text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">
                    Selected time
                  </p>
                  <p className="text-sm font-bold text-brand-900">
                    {selectedDate && fmtShortDate(selectedDate)} at {formatSlot(selectedSlot.start, guestTz)}
                  </p>
                  <p className="text-xs text-brand-500 mt-0.5">
                    {host.meetingDuration} min · {guestTz.replace(/_/g, ' ')}
                  </p>
                </div>
              ) : (
                <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-400">← Pick a date and time to continue</p>
                </div>
              )}

              <Alert type="error" message={error} className="mb-4" />

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="label">Your name</label>
                  <input
                    type="text" required
                    value={form.guestName}
                    onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))}
                    className="input-field" placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email" required
                    value={form.guestEmail}
                    onChange={(e) => setForm((p) => ({ ...p, guestEmail: e.target.value }))}
                    className="input-field" placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="label">
                    Notes <span className="ml-1 text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="input-field resize-none"
                    placeholder="What would you like to discuss?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedSlot}
                  className="btn-primary w-full py-3 text-base"
                >
                  {submitting ? 'Confirming…' : 'Confirm booking →'}
                </button>
                <p className="text-xs text-center text-slate-400">
                  A calendar invite will be sent to your email
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
