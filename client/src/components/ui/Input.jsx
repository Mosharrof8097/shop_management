export default function Input({
  label, name, type = 'text', value, onChange, onKeyDown,
  placeholder, required, disabled, error, hint,
  className = '', prefix, suffix,
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {prefix}
          </div>
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
            form-input
            ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-400' : ''}
            ${prefix ? 'pl-9' : ''}
            ${suffix ? 'pr-9' : ''}
          `}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {suffix}
          </div>
        )}
      </div>
      {error  && <p className="mt-1 text-[0.72rem] text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-[0.72rem] text-gray-400">{hint}</p>}
    </div>
  );
}
