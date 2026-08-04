import { Currency } from '@/shared/domain/enums/currency.enum';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

export class CurrencyConverter {
  public static toMxn(
    amount: number,
    currency: Currency | string,
    exchangeRateUsdToMxn?: number,
  ): number {
    if (currency === Currency.MXN) {
      return amount;
    }
    if (!exchangeRateUsdToMxn) {
      throw new InvalidAttributeException(
        'Exchange rate is required to convert USD to MXN',
        CurrencyConverter.name,
      );
    }
    return Math.round(amount * exchangeRateUsdToMxn * 100) / 100;
  }
}
