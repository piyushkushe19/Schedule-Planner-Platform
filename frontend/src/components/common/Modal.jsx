import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          relative bg-white rounded-3xl shadow-2xl
          w-full ${maxWidths[size]} p-6
          animate-slide-up
        `}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-slate-900 text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="
              w-8 h-8 flex items-center justify-center
              rounded-lg text-slate-400 text-xl leading-none
              hover:bg-slate-100 hover:text-slate-600
              transition-colors
            "
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
