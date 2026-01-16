import { ErrorType } from '../dto/result.dto';
import { DomainException } from './domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message: string, entity: string) {
    super(message, entity, ErrorType.UNAUTHORIZED);
  }
}
