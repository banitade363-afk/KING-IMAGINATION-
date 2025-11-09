import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const dotClasses = 'bg-primary-500 rounded-full';
  
  return (
    <div className={`flex items-center justify-center space-x-1.5 ${sizeClasses}`}>
      <div className={`${dotClasses} w-1.5 h-1.5 animate-[bounce_1s_infinite]`}></div>
      <div className={`${dotClasses} w-1.5 h-1.5 animate-[bounce_1s_0.2s_infinite]`}></div>
      <div className={`${dotClasses} w-1.5 h-1.5 animate-[bounce_1s_0.4s_infinite]`}></div>
    </div>
  );
};

export default Spinner;