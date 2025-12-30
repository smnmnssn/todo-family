"use client";

import * as React from "react";

type Props = {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
};

export default function AuthField({
  id,
  label,
  type = "text",
  name,
  placeholder,
  autoComplete,
  required,
  minLength,
  disabled,
  value,
  onChange,
  errorMessage,
}: Props) {
  const errorId = errorMessage ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white/90">
        {label}
      </label>

      <input
        id={id}
        name={name ?? id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        disabled={disabled}
        value={value}
        onChange={onChange}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:opacity-60 disabled:cursor-not-allowed"
      />

      {errorMessage ? (
        <p id={errorId} className="text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
