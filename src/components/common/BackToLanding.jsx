import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackToLanding = ({ dark = false }) => {
  return (
    <Link
      to="/"
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium 
        transition-all duration-200 group
        ${dark
          ? 'text-secondary-400 hover:text-primary-400 hover:bg-white/5'
          : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
        }
      `}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Back to Landing
    </Link>
  );
};

export default BackToLanding;