
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>

      <input
        id={id}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`}
        {...props}
      />

      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
