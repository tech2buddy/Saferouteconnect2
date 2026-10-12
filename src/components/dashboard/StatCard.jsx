import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, subtitle }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700',
    warning: 'bg-warning-100 text-warning-700',
    info: 'bg-info-100 text-info-700',
    success: 'bg-green-100 text-green-700',
  };

  return (
    <div className="card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full 
            ${trendUp === true ? 'bg-green-50 text-green-600' : ''} 
            ${trendUp === false ? 'bg-red-50 text-red-600' : ''} 
            ${trendUp === null ? 'bg-secondary-100 text-secondary-500' : ''}`}>
            {trendUp === true && <TrendingUp className="w-3 h-3" />}
            {trendUp === false && <TrendingDown className="w-3 h-3" />}
            {trendUp === null && <Minus className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-secondary-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-secondary-400">{subtitle}</p>}
    </div>
  );
};

export default StatCard;