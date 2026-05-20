const map = {
  green:  'badge-green',
  red:    'badge-red',
  yellow: 'badge-yellow',
  blue:   'badge-blue',
  gray:   'badge-gray',
  orange: 'badge bg-orange-100 text-orange-700',
  purple: 'badge bg-purple-100 text-purple-700',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`${map[variant] || 'badge-gray'} ${className}`}>
      {children}
    </span>
  );
}
