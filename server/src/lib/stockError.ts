import { HTTP_STATUS, type HttpStatusCode } from "@trading-signal/contracts/httpStatus";

/** Domain error for stock quote/history failures with an HTTP status code. */
export class StockError extends Error {
  constructor(
    message: string,
    readonly statusCode: HttpStatusCode = HTTP_STATUS.BAD_GATEWAY,
  ) {
    super(message);
    this.name = "StockError";
  }
}
