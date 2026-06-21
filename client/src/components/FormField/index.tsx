import styles from './FormField.module.css'
import type { FormFieldProps } from './types'

/** Labeled text input used by auth and other forms. */
export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required,
  minLength,
}: FormFieldProps) {
  return (
    <label className={styles.field}>
      {label}
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
      />
    </label>
  )
}

export type { FormFieldProps } from './types'
