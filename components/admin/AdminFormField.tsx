import type { ReactNode } from "react";

interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** עטיפת שדה טופס: תווית + שגיאה + רמז */
export default function AdminFormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = "",
}: AdminFormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-bold">
        {label}
        {required && (
          <span className="text-coral" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-semibold text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
