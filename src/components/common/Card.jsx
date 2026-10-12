import React from 'react';

const Card = ({ children, className = '', hover = true, padding = 'p-6', ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-card border border-secondary-100 
      ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5' : ''} 
      ${padding} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;