import React from 'react';

export function Field({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 w-full ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm text-text-secondary mb-2 ${className}`}>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      className={`w-full bg-bg-base border border-border-subtle text-text-primary px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-primary placeholder:text-text-muted ${className}`}
      {...rest}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props;
  return (
    <div className="relative w-full">
      <select
        className={`w-full appearance-none bg-bg-base border border-border-subtle text-text-primary px-4 py-3 pr-10 rounded-lg text-sm outline-none transition-colors focus:border-primary ${className}`}
        {...rest}
      >
        {children}
      </select>
      <div className="absolute right-3 top-[50%] translate-y-[-50%] pointer-events-none text-text-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
  );
}
