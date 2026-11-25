
import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function TextArea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>

      <textarea
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
