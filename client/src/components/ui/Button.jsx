const variants = {
  primary:   'btn-primary',
  secondary: 'btn-outline',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500/30',
};
const sizes = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', disabled = false, fullWidth = false,
  type = 'button', onClick, icon, loading = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${sizes[size]} ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        : icon && <span className="shrink-0">{icon}</span>
      }
      {children}
    </button>
  );
}
