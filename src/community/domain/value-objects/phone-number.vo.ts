import { ErrorType } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export class PhoneNumber extends ValueObject<string> {
  private constructor(value: string) {
    const LADA_2_DIGITS = ['55', '56', '59', '33', '38', '81', '89'];
    const onlyDigits = String(value).replace(/\D/g, '');
    if (onlyDigits.length !== 10) {
      throw new DomainException(
        'Invalid phone number length. It should be 10 digits.',
        PhoneNumber.name,
        ErrorType.VALIDATION,
      );
    }
    const patternSustitution = '($1) $2 $3';
    const lada = onlyDigits.slice(0, 2);
    const regexFormat = LADA_2_DIGITS.includes(lada)
      ? /^(\d{2})(\d{4})(\d{4})$/
      : /^(\d{3})(\d{3})(\d{4})$/;
    super(onlyDigits.replace(regexFormat, patternSustitution));
  }

  public static of(value: string): PhoneNumber {
    return new PhoneNumber(value);
  }

  public updateWith(value: string): PhoneNumber {
    if (value === undefined) return this;
    const nextPhoneNumber = PhoneNumber.of(value);
    return this.equals(nextPhoneNumber) ? this : nextPhoneNumber;
  }
}
