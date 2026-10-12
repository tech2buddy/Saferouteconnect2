import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const AlertBanner = ({ message, onViewAll }) => (
  <button onClick={onViewAll}
    className="w-full flex items-center gap-3 p-4 bg-danger-50 border border-danger-200 rounded-xl mb-6 hover:bg-danger-100 hover:shadow-md transition-all duration-200 text-left group">
    <div className="w-9 h-9 bg-danger-500 rounded-lg flex items-center justify-center flex-shrink-0">
      <AlertTriangle className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-danger-700 uppercase tracking-wide">Alert</p>
      <p className="text-sm text-danger-600 truncate">{message}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-danger-400 group-hover:translate-x-1 transition-transform" />
  </button>
);

export default AlertBanner;