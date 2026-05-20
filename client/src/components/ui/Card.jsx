export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon, color = 'orange', trend }) {
  const colors = {
    orange: 'bg-orange-100 text-orange-600',
    blue:   'bg-blue-100 text-blue-600',
    red:    'bg-red-100 text-red-600',
    green:  'bg-green-100 text-green-600',
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% গত সপ্তাহ থেকে
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
