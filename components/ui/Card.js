export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`card transform transition hover:-translate-y-1 ${className}`} {...props}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      {children}
    </div>
  );
}
