import { ErrorType } from '../dto/result.dto';
import { DomainException } from './domain.exception';

export class ForbiddenException extends DomainException {
  constructor(message: string, entity: string) {
    super(message, entity, ErrorType.FORBIDDEN);
  }
}
