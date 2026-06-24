import { Button } from '@/components/Button'
import styles from './AppHeader.module.css'
import type { AppHeaderProps } from './types'

/** Top bar showing the signed-in user and sign-out action. */
function AppHeader({ email, onLogout }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1>Trading Signal</h1>
        <p className={styles.userLine}>Signed in as {email}</p>
      </div>
      <Button variant="secondary" onClick={onLogout}>
        Sign out
      </Button>
    </header>
  )
}

export default AppHeader
