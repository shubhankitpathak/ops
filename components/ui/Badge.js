export default function Badge({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded border border-purple-600/30',
    success: 'px-2 py-0.5 bg-green-600/10 text-green-400 text-xs rounded border border-green-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm ${className}`}>
      {children}
    </span>
  );
}
