export default function Button({ children, variant = 'default', className = '', ...props }) {
  const base = 'btn';
  const variants = {
    default: 'btn-default',
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
    accent: 'btn-accent'
  };

  const cls = `${base} ${variants[variant] || variants.default} ${className}`.trim();
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
