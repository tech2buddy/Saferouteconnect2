import React from 'react';
import { Shield } from 'lucide-react';

const SafetyCard = () => {
  return (
    <div className="mx-3 mb-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <h4 className="font-display font-semibold text-xs text-primary-800">
          Your safety matters
        </h4>
      </div>

      <p className="text-xs text-primary-700 leading-relaxed mb-3">
        Report incidents, stay alert, and help build a safer community for everyone.
      </p>

      {/* Simple illustration */}
      <div className="flex items-end justify-center gap-1.5 pt-1">
        {/* Person 1 */}
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-primary-500 mb-0.5" />
          <div className="w-5 h-6 bg-primary-500 rounded-t-md" />
        </div>
        {/* Person 2 (taller) */}
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-primary-600 mb-0.5" />
          <div className="w-6 h-7 bg-primary-600 rounded-t-md" />
        </div>
        {/* Person 3 */}
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-primary-500 mb-0.5" />
          <div className="w-5 h-6 bg-primary-500 rounded-t-md" />
        </div>
      </div>

      {/* Ground */}
      <div className="h-1 bg-primary-300 rounded-full mt-1" />
    </div>
  );
};

export default SafetyCard;