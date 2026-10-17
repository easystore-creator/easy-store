import React, { useState } from 'react';

interface OwnerAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DEFAULT_OWNER_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

export const OwnerAvatar: React.FC<OwnerAvatarProps> = ({ className = '', size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white font-black flex items-center justify-center shrink-0 shadow-sm ${className}`}
        title="Store Founder: Abdullah"
      >
        <span>A</span>
      </div>
    );
  }

  return (
    <img
      src={DEFAULT_OWNER_PHOTO}
      alt="Store Founder Abdullah"
      onError={() => setImageError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ${className}`}
    />
  );
};
