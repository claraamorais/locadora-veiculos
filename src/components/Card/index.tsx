
import type { ReactNode } from "react";

interface CardProps {
  titulo?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({
  titulo,
  children,
  className = "",
}: CardProps) {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-body">
        {titulo && (
          <h5 className="card-title mb-3">
            {titulo}
          </h5>
        )}

        {children}
      </div>
    </div>
  );
}
