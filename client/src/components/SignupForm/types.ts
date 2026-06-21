export type SignupFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>
}
