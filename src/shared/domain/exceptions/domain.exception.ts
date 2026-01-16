import { ErrorType } from '../dto/result.dto';

export class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly entityName: string,
    public readonly type: ErrorType,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
