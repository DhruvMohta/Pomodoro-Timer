import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-2 uppercase font-bold tracking-widest transition-all duration-200 border-2 active:scale-95 group overflow-hidden";
  
  // Using arbitrary values in Tailwind to reference the CSS variables defined in index.html
  const variants = {
    primary: `border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black hover:shadow-[0_0_15px_var(--color-primary)]`,
    secondary: `border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-black hover:shadow-[0_0_15px_var(--color-secondary)]`,
    danger: `border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black hover:shadow-[0_0_15px_#ff0090]`,
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};