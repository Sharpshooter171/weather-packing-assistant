export type AppErrorCode =
  | "INVALID_REQUEST_BODY"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_LOCATION_INPUT"
  | "INVALID_DATE_RANGE"
  | "UNSUPPORTED_DATE_RANGE"
  | "LOCATION_NOT_FOUND"
  | "WEATHER_API_ERROR"
  | "WEATHER_REQUEST_NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, statusCode = 400, details?: unknown) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
