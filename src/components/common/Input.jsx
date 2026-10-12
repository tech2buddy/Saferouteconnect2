import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, helperText, icon: Icon, iconPosition = 'left',
  type = 'text', required = false, className = '', containerClassName = '', ...props
}, ref) => {
  const inputId = props.id || props.name;
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700 mb-1.5">
          {label}{required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        <input
          ref={ref} id={inputId} type={type}
          className={`w-full rounded-lg border transition-all duration-200 
            ${Icon && iconPosition === 'left' ? 'pl-10' : 'pl-4'} 
            ${Icon && iconPosition === 'right' ? 'pr-10' : 'pr-4'} 
            py-2.5 text-secondary-900 placeholder-secondary-400 
            ${error ? 'border-danger-300 focus:border-danger-500' : 'border-secondary-300 focus:border-primary-500 hover:border-secondary-400'} 
            focus:outline-none ${className}`}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;