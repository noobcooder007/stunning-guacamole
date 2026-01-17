import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export class ExpiresAtDate extends ValueObject<Date> {
  private static readonly CLOCK_SKEW_SECONDS = 10;
  private constructor(date: Date) {
    GeneralGuard.againstNullOrUndefined(
      date,
      'Id cannot be null or undefined',
      ExpiresAtDate.name,
    );
    super(date);
  }

  public static of(date: Date): ExpiresAtDate {
    GeneralGuard.againstBeforeTodayDate(date, ExpiresAtDate.name);
    return new ExpiresAtDate(date);
  }

  public isAlive(now: Date = new Date()): boolean {
    const expirationThreshold =
      this.value.getTime() - ExpiresAtDate.CLOCK_SKEW_SECONDS * 1000;
    return now.getTime() < expirationThreshold;
  }
}
