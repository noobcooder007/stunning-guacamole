import { ErrorType } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class InvalidAttributeException extends DomainException {
  constructor(message: string, entity: string) {
    super(message, entity, ErrorType.VALIDATION);
  }
}
