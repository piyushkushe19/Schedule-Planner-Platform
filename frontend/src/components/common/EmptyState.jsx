export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-4 select-none">{icon}</div>
      <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
