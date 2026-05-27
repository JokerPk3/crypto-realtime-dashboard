export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public context?: unknown;

  constructor(message: string, statusCode: number, context?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, context?: unknown) {
    return new AppError(message, 400, context);
  }

  static unauthorized(message: string, context?: unknown) {
    return new AppError(message, 401, context);
  }

  static forbidden(message: string, context?: unknown) {
    return new AppError(message, 403, context);
  }

  static notFound(message: string, context?: unknown) {
    return new AppError(message, 404, context);
  }

  static internal(message: string, context?: unknown) {
    return new AppError(message, 500, context);
  }
}
