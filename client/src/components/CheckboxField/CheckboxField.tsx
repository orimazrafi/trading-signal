import styles from './CheckboxField.module.css'
import type { CheckboxFieldProps } from './types'

/** Labeled checkbox used in forms and settings panels. */
function CheckboxField({ label, checked, disabled = false, onChange }: CheckboxFieldProps) {
  return (
    <label className={styles.field}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

export default CheckboxField
