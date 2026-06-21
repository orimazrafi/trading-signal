import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../Button'
import { FormField } from '../FormField'
import styles from './LoginForm.module.css'
import type { LoginFormProps } from './types'

/** Email and password login form. */
export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
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
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        required
      />
      <Button type="submit" loading={submitting} loadingLabel="Signing in...">
        Sign in
      </Button>
    </form>
  )
}

