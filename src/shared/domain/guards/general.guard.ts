import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

export class GeneralGuard {
  public static againstNullOrUndefined(
    value: any,
    message: string,
    entity: string,
  ) {
    if (value === null || value === undefined) {
      throw new InvalidAttributeException(message, entity);
    }
  }

  public static againstGreatherThanZero(
    value: number,
    message: string,
    entity: string,
  ) {
    if (value <= 0) {
      throw new InvalidAttributeException(message, entity);
    }
  }

  public static againstBothAreEquals(
    value1: any,
    value2: any,
    message: string,
    entity: string,
  ) {
    if (value1 === value2) {
      throw new InvalidAttributeException(message, entity);
    }
  }

  public static againstLengthIsEqualsTo(
    value: string,
    length: number,
    message: string,
    entity: string,
  ) {
    if (value.length !== length) {
      throw new InvalidAttributeException(message, entity);
    }
  }

  public static mutuallyExclusive(
    valu1: any,
    value2: any,
    message: string,
    entity: string,
  ) {
    if (valu1 && value2) {
      throw new InvalidAttributeException(message, entity);
    }
  }

  public static againstArrayLengthIsGreaterThan(
    length: number,
    value: number = 0,
    message: string,
    entity: string,
  ) {
    if (length <= value) {
      throw new InvalidAttributeException(message, entity);
    }
  }
}
