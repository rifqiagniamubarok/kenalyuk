/**
 * Reusable authentication form component
 * Used for login, registration, and other auth flows
 */

'use client';

import { FormEvent, ReactNode } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitText: string;
  loading?: boolean;
  error?: string;
  children: ReactNode;
  footerLinks?: {
    text: string;
    linkText: string;
    href: string;
  }[];
}

export default function AuthForm({ title, subtitle, onSubmit, submitText, loading = false, error, children, footerLinks }: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Kenalyuk</h1>
          <h2 className="text-xl font-semibold text-text-primary mt-4">{title}</h2>
          {subtitle && <p className="text-text-secondary mt-2">{subtitle}</p>}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          {children}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-md font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : submitText}
          </button>
        </form>

        {/* Footer Links */}
        {footerLinks && footerLinks.length > 0 && (
          <div className="mt-6 space-y-2">
            {footerLinks.map((link, index) => (
              <div key={index} className="text-center text-sm text-text-secondary">
                {link.text}{' '}
                <Link href={link.href} className="font-medium text-primary hover:text-primary-dark transition-colors">
                  {link.linkText}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Terms */}
        <p className="mt-8 text-xs text-text-secondary text-center">By continuing, you agree to our syariah-compliant guidelines and community standards</p>
      </div>
    </div>
  );
}

/**
 * Input field component for auth forms
 */
interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  helperText?: string;
}

export function AuthInput({ id, name, type, label, value, onChange, required = false, autoComplete, placeholder, helperText }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-text-primary"
        placeholder={placeholder}
      />
      {helperText && <p className="mt-1 text-xs text-text-secondary">{helperText}</p>}
    </div>
  );
}
