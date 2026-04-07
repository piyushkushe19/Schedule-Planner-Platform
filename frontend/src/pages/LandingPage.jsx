import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '⚡', title: 'Zero back-and-forth',    desc: 'Share one link. Guests pick a time that works for them.' },
  { icon: '🗓️', title: 'Google Calendar sync',   desc: 'Meetings auto-appear in your calendar. No copy-paste.' },
  { icon: '🌍', title: 'Timezone-aware',          desc: 'Every guest sees slots in their own local timezone.' },
  { icon: '🤖', title: 'AI-powered suggestions',  desc: 'Smart recommendations for the best available slots.' },
  { icon: '🔒', title: 'No double bookings',      desc: 'Real-time conflict detection keeps your calendar safe.' },
  { icon: '⏱️', title: 'Customisable buffers',   desc: 'Add breathing room between back-to-back meetings.' },
];

const DEMO_TIMES = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','2:00 PM','2:30 PM','3:00 PM'];
const DEMO_DAYS  = [
  { label: 'M', num: 13, active: false },
  { label: 'T', num: 14, active: false },
  { label: 'W', num: 15, active: true  },
  { label: 'T', num: 16, active: false },
  { label: 'F', num: 17, active: false },
  { label: 'S', num: 18, disabled: true },
  { label: 'S', num: 19, disabled: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-white">Schedulr</span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm text-white/50 hover:text-white px-4 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Now with AI-powered scheduling
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
            Schedule meetings
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              without the chaos
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            Share your Schedulr link. Guests pick a slot that works.
            It shows up in your Google Calendar automatically — no emails, no spreadsheets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg shadow-brand-900/40"
            >
              Start scheduling free →
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-base px-8 py-4 rounded-xl transition-colors border border-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mock UI ─────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-sm shadow-2xl">
          {/* Host row */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/10 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/30 flex items-center justify-center text-brand-300 font-display font-bold">
              A
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Alex Johnson</p>
              <p className="text-white/30 text-xs">30 min · Google Meet</p>
            </div>
          </div>

          {/* Days */}
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Select a date</p>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {DEMO_DAYS.map((d, i) => (
              <div
                key={i}
                className={`
                  flex flex-col items-center py-2.5 rounded-xl text-sm transition-colors
                  ${d.active   ? 'bg-brand-500 text-white font-semibold' :
                    d.disabled ? 'text-white/15 cursor-not-allowed' :
                                 'text-white/50 hover:bg-white/8 cursor-pointer'}
                `}
              >
                <span className="text-xs mb-0.5 opacity-60">{d.label}</span>
                <span className="font-semibold">{d.num}</span>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Available times</p>
          <div className="grid grid-cols-4 gap-2">
            {DEMO_TIMES.map((t, i) => (
              <div
                key={t}
                className={`
                  py-2.5 text-center text-sm rounded-xl border transition-colors cursor-pointer
                  ${i === 2
                    ? 'bg-brand-500 border-brand-500 text-white font-semibold'
                    : 'border-white/10 text-white/50 hover:border-brand-400/50 hover:text-brand-300'}
                `}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
            Everything you need to schedule smarter
          </h2>
          <p className="text-white/35 text-lg">Built for professionals who value their time.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="
                p-6 bg-white/[0.03] border border-white/8 rounded-2xl
                hover:bg-white/[0.06] hover:border-brand-500/20
                transition-all duration-200
              "
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-brand-600 to-violet-700 rounded-3xl p-10 text-center shadow-2xl shadow-brand-900/40">
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Ready to reclaim your time?
          </h2>
          <p className="text-white/60 mb-8">Join thousands of professionals scheduling smarter.</p>
          <Link
            to="/register"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors"
          >
            Get started for free →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-white/20 text-sm">
        © {new Date().getFullYear()} Schedulr — Built with React, Node.js and Google Calendar API
      </footer>
    </div>
  );
}
