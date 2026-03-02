export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2 bg-gray-800/60 border border-gray-700/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${className}`}
      {...props}
    />
  );
}
