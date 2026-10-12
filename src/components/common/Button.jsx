import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, iconPosition = 'left', className = '', ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 hover:shadow-lg hover:shadow-primary-500/25',
    secondary: 'bg-white hover:bg-secondary-50 text-secondary-700 border border-secondary-300 focus:ring-secondary-400 hover:shadow-md',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500',
    ghost: 'bg-transparent hover:bg-secondary-100 text-secondary-600',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /><span>Loading...</span></>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};

export default Button;