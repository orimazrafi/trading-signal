export type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>
}
