export default function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function StatCard({ title, value, subtitle, icon, iconBg = 'bg-primary-100', iconColor = 'text-primary-600', trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="stat-label truncate">{title}</p>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="text-[0.72rem] text-gray-400 mt-0.5">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-[0.7rem] font-semibold mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% গত সপ্তাহ থেকে
          </p>
        )}
      </div>
    </div>
  );
}
