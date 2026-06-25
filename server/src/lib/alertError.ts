import { HTTP_STATUS, type HttpStatusCode } from "@trading-signal/contracts/httpStatus";

/** Domain error for price-alert operations with an HTTP status code. */
export class AlertError extends Error {
  constructor(
    message: string,
    readonly statusCode: HttpStatusCode = HTTP_STATUS.BAD_REQUEST,
  ) {
    super(message);
    this.name = "AlertError";
  }
}
