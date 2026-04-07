import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="font-display text-9xl font-bold text-slate-100 select-none mb-2">
          404
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
          Page not found
        </h1>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto">
          This page doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary px-8 py-3">
          Go home
        </Link>
      </div>
    </div>
  );
}
