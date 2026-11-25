
import type { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  variant?: "success" | "danger" | "warning" | "info";
}

export default function Alert({
  children,
  variant = "info",
}: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      {children}
    </div>
  );
}
