import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { initials } from '../../utils/helpers';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    path: '/availability',
    label: 'Availability',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth="2"/>
        <path d="M12 7v5l3 3" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/bookings',
    label: 'Bookings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" strokeWidth="2"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }) {
  const { user, logout }  = useAuth();
  const location          = useLocation();
  const navigate          = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="font-display text-2xl font-bold text-brand-600 tracking-tight"
        >
          Schedulr
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <span className={active ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-100 space-y-0.5">
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <div className="
            w-8 h-8 rounded-full bg-brand-600 text-white
            flex items-center justify-center
            text-xs font-bold flex-shrink-0
          ">
            {initials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate leading-tight">
              @{user?.username}
            </p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-4 py-2.5
            text-sm text-slate-500
            hover:text-red-600 hover:bg-red-50
            rounded-xl transition-all
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-20">
        <SidebarInner />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full shadow-2xl">
            <SidebarInner />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between">
        <span className="font-display text-xl font-bold text-brand-600">Schedulr</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0 p-5 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
