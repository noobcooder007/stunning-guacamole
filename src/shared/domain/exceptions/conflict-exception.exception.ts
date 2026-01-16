import { ErrorType } from '../dto/result.dto';
import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  constructor(message: string, entity: string) {
    super(message, entity, ErrorType.CONFLICT);
  }
}
