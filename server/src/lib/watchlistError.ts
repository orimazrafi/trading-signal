import { HTTP_STATUS, type HttpStatusCode } from "@trading-signal/contracts/httpStatus";

/** Domain error for watchlist validation and business-rule failures. */
export class WatchlistError extends Error {
  constructor(
    message: string,
    readonly statusCode: HttpStatusCode = HTTP_STATUS.BAD_REQUEST,
  ) {
    super(message);
    this.name = "WatchlistError";
  }
}
