export enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  // El recurso sí se creó/persistió; solo falló un paso posterior no
  // transaccional (ej. renderizar el PDF en el worker). Distinto de una
  // falla real, para que el cliente pueda avisar sin sugerir reintentar
  // la creación (generaría un duplicado).
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
}

export interface IErrorResult {
  type: ErrorType;
  message: string;
  entity: string;
}

export class Result<T, E extends IErrorResult = IErrorResult> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: E,
  ) {
    Object.freeze(this);
  }

  static ok<U>(value?: U): Result<U, any> {
    return new Result<U, any>(true, value, undefined);
  }

  static fail<U, F extends IErrorResult>(error: F): Result<U, F> {
    return new Result<U, F>(false, undefined, error);
  }
}
