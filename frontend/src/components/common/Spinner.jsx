export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-12 h-12 border-4',
  };
  return (
    <div
      className={`${sizes[size]} border-brand-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
