import { Result } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

export class BaseController {
  protected handleResult<T>(result: Result<T>) {
    if (result.isSuccess) return result;
    throw new DomainException(
      result.error.message,
      result.error.entity,
      result.error.type,
    );
  }
}
