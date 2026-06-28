import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { FormField } from '@/components/FormField'
import type { LoginFormProps } from './types'
import styles from './LoginForm.module.css'

/** Email and password login form. */
function LoginForm({ onSubmit }: LoginFormProps) {
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

export default LoginForm
