import { ErrorType } from '../dto/result.dto';
import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(message: string, entity: string) {
    super(message, entity, ErrorType.NOT_FOUND);
  }
}
