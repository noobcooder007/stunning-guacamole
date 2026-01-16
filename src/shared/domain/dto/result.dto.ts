export enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: {
      type: ErrorType;
      message: string;
      entity: string;
    },
  ) {
    Object.freeze(this);
  }

  static ok<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  static fail<T>(type: ErrorType, message: string, entity: string): Result<T> {
    return new Result<T>(false, undefined, { type, message, entity });
  }
}
