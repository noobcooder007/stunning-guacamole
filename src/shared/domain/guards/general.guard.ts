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

  public static againstArrayLengthIsLessThan(
    length: number,
    value: number = 0,
    message: string,
    entity: string,
  ) {
    if (length <= value) {
      throw new InvalidAttributeException(message, entity);
    }
  }

  public static againstValueIsUUID(value: string, entity: string) {
    const uuidRegex =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    if (!value.match(uuidRegex)) {
      throw new InvalidAttributeException('Value is not a valid UUID', entity);
    }
  }

  public static againstBeforeTodayDate(value: Date, entity: string) {
    const today = new Date();
    if (value.getTime() <= today.getTime()) {
      throw new InvalidAttributeException('Date is before today date', entity);
    }
  }

  public static againstIPNotValid(value: string, entity: string) {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!value.match(ipRegex)) {
      throw new InvalidAttributeException('IP is not valid', entity);
    }
  }
}
