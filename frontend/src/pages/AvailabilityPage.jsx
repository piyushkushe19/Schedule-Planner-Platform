import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getMyAvailability, updateAvailability } from '../services/availabilityService';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const makeDefault = () =>
  DAYS.map((_, i) => ({
    dayOfWeek: i,
    isActive: i >= 1 && i <= 5,
    slots: i >= 1 && i <= 5 ? [{ startTime: '09:00', endTime: '17:00' }] : [],
  }));

export default function AvailabilityPage() {
  const [avail,    setAvail]    = useState(makeDefault());
  const [duration, setDuration] = useState(30);
  const [buffer,   setBuffer]   = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([
      getMyAvailability(),
      api.get('/auth/me'),
    ])
      .then(([avRes, meRes]) => {
        if (avRes.data.availability?.length) {
          setAvail(avRes.data.availability);
        }
        setDuration(meRes.data.user.meetingDuration || 30);
        setBuffer(meRes.data.user.bufferTime || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (i) =>
    setAvail((prev) =>
      prev.map((d, idx) =>
        idx !== i ? d : {
          ...d,
          isActive: !d.isActive,
          slots: !d.isActive ? [{ startTime: '09:00', endTime: '17:00' }] : [],
        }
      )
    );

  const updateSlot = (di, si, field, val) =>
    setAvail((prev) =>
      prev.map((d, i) =>
        i !== di ? d : {
          ...d,
          slots: d.slots.map((s, j) => (j !== si ? s : { ...s, [field]: val })),
        }
      )
    );

  const addSlot = (di) =>
    setAvail((prev) =>
      prev.map((d, i) =>
        i !== di ? d : {
          ...d,
          slots: [...d.slots, { startTime: '13:00', endTime: '17:00' }],
        }
      )
    );

  const removeSlot = (di, si) =>
    setAvail((prev) =>
      prev.map((d, i) =>
        i !== di ? d : { ...d, slots: d.slots.filter((_, j) => j !== si) }
      )
    );

  const handleSave = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await updateAvailability({ availability: avail });
      await api.put('/users/profile', {
        meetingDuration: Number(duration),
        bufferTime:      Number(buffer),
      });
      setMsg({ type: 'success', text: 'Availability saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Availability</h1>
            <p className="text-slate-400 mt-1">Set when guests can book time with you</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-shrink-0">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {msg.text && <Alert type={msg.type} message={msg.text} className="mb-6" />}

        {/* Meeting settings */}
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide text-slate-500">
            Meeting settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Meeting duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(+e.target.value)}
                className="input-field bg-white"
              >
                {[15, 30, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Buffer between meetings</label>
              <select
                value={buffer}
                onChange={(e) => setBuffer(+e.target.value)}
                className="input-field bg-white"
              >
                {[0, 5, 10, 15, 30].map((b) => (
                  <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} minutes`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Weekly schedule */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            Weekly schedule
          </p>

          {avail.map((day, di) => (
            <div
              key={di}
              className={`card p-4 transition-all ${
                day.isActive ? 'ring-1 ring-brand-200' : 'opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Toggle switch */}
                <button
                  onClick={() => toggleDay(di)}
                  className={`
                    mt-0.5 relative w-10 h-5 rounded-full flex-shrink-0
                    transition-colors duration-200
                    ${day.isActive ? 'bg-brand-600' : 'bg-slate-200'}
                  `}
                  aria-label={`Toggle ${DAYS[di]}`}
                >
                  <span
                    className={`
                      absolute top-0.5 left-0.5 w-4 h-4
                      bg-white rounded-full shadow
                      transition-transform duration-200
                      ${day.isActive ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>

                {/* Day name */}
                <div className="w-24 flex-shrink-0 pt-0.5">
                  <span className={`text-sm font-semibold ${day.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {DAYS[di]}
                  </span>
                </div>

                {/* Slots */}
                <div className="flex-1 min-w-0">
                  {!day.isActive ? (
                    <span className="text-sm text-slate-400 italic">Unavailable</span>
                  ) : (
                    <div className="space-y-2">
                      {day.slots.map((slot, si) => (
                        <div key={si} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(di, si, 'startTime', e.target.value)}
                            className="input-field py-1.5 px-3 text-sm w-auto flex-shrink-0"
                          />
                          <span className="text-slate-300 text-sm">–</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(di, si, 'endTime', e.target.value)}
                            className="input-field py-1.5 px-3 text-sm w-auto flex-shrink-0"
                          />
                          {day.slots.length > 1 && (
                            <button
                              onClick={() => removeSlot(di, si)}
                              className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addSlot(di)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1 mt-1"
                      >
                        <span className="text-base leading-none">+</span>
                        Add time slot
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save bottom */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
