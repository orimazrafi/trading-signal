import styles from './FormField.module.css'
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
    <label className={styles.field}>
      {label}
      <input
        className={styles.input}
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
