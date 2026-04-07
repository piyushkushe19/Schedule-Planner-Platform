export default function Alert({ type = 'error', message, className = '' }) {
  if (!message) return null;

  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info:    'bg-brand-50 border-brand-200 text-brand-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  const icons = {
    error:   '✕',
    success: '✓',
    info:    'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3
        rounded-xl border text-sm
        animate-fade-in
        ${styles[type]} ${className}
      `}
    >
      <span className="font-bold mt-0.5 flex-shrink-0">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
