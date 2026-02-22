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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Kenalyuk!</h1>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">{title}</h2>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
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
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : submitText}
          </button>
        </form>

        {/* Footer Links */}
        {footerLinks && footerLinks.length > 0 && (
          <div className="mt-6 space-y-2">
            {footerLinks.map((link, index) => (
              <div key={index} className="text-center text-sm text-gray-600">
                {link.text}{' '}
                <Link href={link.href} className="font-medium text-purple-600 hover:text-purple-500">
                  {link.linkText}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Terms */}
        <p className="mt-8 text-xs text-gray-500 text-center">By continuing, you agree to our syariah-compliant guidelines and community standards</p>
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
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
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
        placeholder={placeholder}
      />
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
