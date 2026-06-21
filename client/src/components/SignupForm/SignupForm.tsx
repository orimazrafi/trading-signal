import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../Button'
import { FormField } from '../FormField'
import styles from './SignupForm.module.css'
import type { SignupFormProps } from './types'

/** Email and password registration form. */
export function SignupForm({ onSubmit }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      await onSubmit(email, password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        minLength={8}
        required
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        minLength={8}
        required
      />
      {localError && <p className={styles.error}>{localError}</p>}
      <Button type="submit" loading={submitting} loadingLabel="Creating account...">
        Create account
      </Button>
    </form>
  )
}

