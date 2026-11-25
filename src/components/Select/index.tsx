
import type { SelectHTMLAttributes } from "react";

interface Opcao {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  opcoes: Opcao[];
  error?: string;
}

export default function Select({
  label,
  opcoes,
  error,
  id,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>

      <select
        id={id}
        className={`form-select ${error ? "is-invalid" : ""} ${className}`}
        {...props}
      >
        <option value="">Selecione uma opção</option>

        {opcoes.map((opcao) => (
          <option key={opcao.value} value={opcao.value}>
            {opcao.label}
          </option>
        ))}
      </select>

      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
