export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class StorageError extends AppError {
  constructor(
    message: string,
    public storageCode: 'NOT_FOUND' | 'UPLOAD_FAILED' | 'INVALID_TYPE' | 'INVALID_SIZE' | 'INVALID_NAME' | 'ALREADY_EXISTS' | 'PERMISSION_DENIED',
    details?: unknown
  ) {
    super(message, `STORAGE_${storageCode}`, 400, details);
    this.name = 'StorageError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} o identyfikatorze "${identifier}" nie został znaleziony`
      : `${resource} nie został znaleziony`;
    super(message, 'NOT_FOUND', 404, { resource, identifier });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Brak autoryzacji') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Brak uprawnień do wykonania tej operacji') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleApiError(error: unknown) {
  if (isAppError(error)) {
    return {
      status: error.status,
      body: error.toJSON(),
    };
  }

  const message = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
  const stack = error instanceof Error ? error.stack : undefined;

  console.error('Unexpected error:', { message, stack });

  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Wystąpił nieoczekiwany błąd serwera',
      },
    },
  };
}
