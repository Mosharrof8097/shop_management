export default function Input({
  label, name, type = 'text', value, onChange, onKeyDown,
  placeholder, required, disabled, error, hint,
  className = '', prefix, suffix,
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full border rounded-lg text-sm text-gray-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
            disabled:bg-gray-50 disabled:text-gray-500
            transition-colors
            ${error ? 'border-red-400' : 'border-gray-300'}
            ${prefix ? 'pl-8' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} py-2
          `}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 text-sm">{suffix}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
