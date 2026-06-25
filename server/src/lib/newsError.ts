import { HTTP_STATUS, type HttpStatusCode } from "@trading-signal/contracts/httpStatus";

/** Domain error for dashboard news feed failures with an HTTP status code. */
export class NewsFeedError extends Error {
  constructor(
    message: string,
    readonly statusCode: HttpStatusCode = HTTP_STATUS.SERVICE_UNAVAILABLE,
  ) {
    super(message);
    this.name = "NewsFeedError";
  }
}
