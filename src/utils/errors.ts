export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }

  return new AppError('Ocorreu um erro inesperado', 'UNKNOWN_ERROR');
} 