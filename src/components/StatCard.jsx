import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color = 'blue',
  trend,
  trendValue,
  loading = false 
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      gradient: 'from-red-500 to-red-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      gradient: 'from-yellow-500 to-yellow-600'
    }
  };

  const colorScheme = colors[color] || colors.blue;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 animate-pulse">
        <div className="flex items-center">
          <div className={`p-4 rounded-xl ${colorScheme.bg} w-16 h-16`}></div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 card-hover group">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${colorScheme.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {trend && trendValue && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
