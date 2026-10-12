import React from 'react';
import { MapPin } from 'lucide-react';

const RouteMap = ({ height = '400px' }) => {
  return (
    <div className="relative w-full bg-gradient-to-br from-green-50 to-blue-50 rounded-xl overflow-hidden"
      style={{ height }}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-secondary-400" />
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary-400" />
        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-secondary-400" />
        <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-secondary-400" />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-secondary-400" />
        <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-secondary-400" />
      </div>

      <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-danger-500/30 rounded-full blur-xl" />
      <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-warning-500/30 rounded-full blur-xl" />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
        <path d="M 50 350 Q 150 250 200 200 T 350 50"
          fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeDasharray="8,4" />
      </svg>

      <div className="absolute bottom-[12%] left-[12%]">
        <div className="w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg" />
      </div>
      <div className="absolute top-[10%] right-[10%]">
        <div className="w-6 h-6 bg-danger-500 rounded-full border-4 border-white shadow-lg" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <MapPin className="w-12 h-12 text-primary-600/30" />
      </div>
    </div>
  );
};

export default RouteMap;