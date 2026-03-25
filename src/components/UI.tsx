import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  key?: React.Key;
  variant?: 'default' | 'glass' | 'outline' | 'navy';
}

export function Card({ children, className, title, subtitle, variant = 'default' }: CardProps) {
  const variants = {
    default: "bg-brand-card shadow-brand border border-brand-border/50",
    glass: "glass shadow-brand",
    outline: "bg-transparent border-2 border-brand-border",
    navy: "bg-brand-navy text-white shadow-xl",
  };

  return (
    <div className={cn("rounded-[2.5rem] p-6 md:p-8 transition-all duration-300", variants[variant], className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className={cn("text-xl font-bold font-serif", variant === 'navy' ? "text-white" : "text-brand-navy")}>{title}</h3>}
          {subtitle && <p className={cn("text-sm mt-1", variant === 'navy' ? "text-blue-100/70" : "text-gray-400")}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'white';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  fullWidth,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-pink text-white hover:bg-pink-600 shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50",
    secondary: "bg-brand-navy text-white hover:bg-slate-800 shadow-lg shadow-navy-200/20",
    outline: "border-2 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white",
    ghost: "text-gray-500 hover:bg-brand-card/50 dark:text-gray-400",
    danger: "bg-brand-danger text-white hover:bg-red-600 shadow-lg shadow-red-200/50",
    success: "bg-brand-success text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200/50",
    white: "bg-white text-brand-pink hover:bg-pink-50 shadow-lg shadow-white/10 dark:bg-brand-card dark:hover:bg-brand-navy/50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3.5 rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-[1.25rem]",
  };

  return (
    <button 
      className={cn(
        "font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'outline', className?: string }) {
  const variants = {
    default: "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400",
    success: "bg-emerald-50 text-brand-success dark:bg-emerald-950/30",
    danger: "bg-red-50 text-brand-danger dark:bg-red-950/30",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/30",
    info: "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
    primary: "bg-pink-50 text-brand-primary dark:bg-pink-950/30",
    outline: "bg-transparent border border-brand-border text-gray-400",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-bold text-brand-navy/70 ml-1">{label}</label>}
      <input 
        className="w-full px-5 py-3.5 rounded-2xl border border-brand-border bg-brand-card text-brand-navy focus:ring-4 focus:ring-brand-pink/10 focus:border-brand-pink/30 outline-none transition-all duration-200 placeholder:text-gray-300"
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, ...props }: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-bold text-brand-navy/70 ml-1">{label}</label>}
      <select 
        className="w-full px-5 py-3.5 rounded-2xl border border-brand-border bg-brand-card text-brand-navy focus:ring-4 focus:ring-brand-pink/10 focus:border-brand-pink/30 outline-none transition-all duration-200 appearance-none cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
