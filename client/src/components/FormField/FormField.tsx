import { cn } from '@/lib/utils'
import type { FormFieldProps } from './types'

/** Labeled text input used by auth and other forms. */
function FormField({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  minLength,
  min,
  max,
  step,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-left text-sm font-medium text-foreground">
      {label}
      <input
        className={cn(
          'rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        )}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        min={min}
        max={max}
        step={step}
      />
    </label>
  )
}

export default FormField
