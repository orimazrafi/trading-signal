export type FormFieldProps = {
  label: string
  type?: 'email' | 'password' | 'text'
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  minLength?: number
}
