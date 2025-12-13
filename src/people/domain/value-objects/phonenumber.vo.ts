export class PhoneNumber {
  value: string;

  constructor(value: string) {
    this.setValue(value);
  }

  private setValue(value: string): PhoneNumber {
    const LADA_2_DIGITS = ['55', '56', '59', '33', '38', '81', '89'];
    const onlyDigits = String(value).replace(/\D/g, '');
    if (onlyDigits.length !== 10) {
      throw new Error('Invalid phone number length. It should be 10 digits.');
    }
    const patternSustitution = '($1) $2 $3';
    const lada = onlyDigits.slice(0, 2);
    const regexFormat = LADA_2_DIGITS.includes(lada)
      ? /^(\d{2})(\d{4})(\d{4})$/
      : /^(\d{3})(\d{3})(\d{4})$/;
    this.value = onlyDigits.replace(regexFormat, patternSustitution);
    return this;
  }
}
