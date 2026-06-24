export type FormFieldProps = {
  label: string
  type?: 'email' | 'password' | 'text' | 'number'
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  min?: number
  max?: number
  step?: number | string
}
