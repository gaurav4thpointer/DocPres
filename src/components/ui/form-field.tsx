import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({ label, required, error, hint, children, className, htmlFor }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
