import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import Dashboard          from './pages/Dashboard';
import AvailabilityPage   from './pages/AvailabilityPage';
import BookingsPage       from './pages/BookingsPage';
import ProfilePage        from './pages/ProfilePage';
import BookingPage        from './pages/BookingPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import NotFoundPage       from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/book/:username"    element={<BookingPage />} />
          <Route path="/booking-confirmed" element={<BookingConfirmPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/bookings"    element={<BookingsPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
