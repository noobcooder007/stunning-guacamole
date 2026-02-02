export class MaskHelper {
  /**
   * Enmascara un string dejando visibles solo los últimos N caracteres.
   * @param value El texto a enmascarar
   * @param visibleCount Cantidad de caracteres visibles al final
   * @param maskChar Carácter de enmascaramiento
   */
  static mask(
    value: string,
    visibleCount: number = 4,
    maskChar: string = '*',
  ): string {
    if (!value) return null;
    if (value.length <= visibleCount) return value;

    const visiblePart = value.slice(-visibleCount);
    const maskedPart = maskChar.repeat(value.length - visibleCount);

    // Opcional: Puedes limitar la cantidad de asteriscos para no revelar la longitud real
    // const maskedPart = maskChar.repeat(5);

    return `${maskedPart}${visiblePart}`;
  }

  static maskEmail(email: string): string {
    if (!email) return null;
    const [user, domain] = email.split('@');
    return `${user.charAt(0)}****@${domain}`;
  }
}
