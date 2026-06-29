/** Returned when a concurrent worker already disabled the alert before trigger completed. */
export class AlertAlreadyTriggeredError extends Error {
  constructor() {
    super("alert already triggered");
    this.name = "AlertAlreadyTriggeredError";
  }
}
