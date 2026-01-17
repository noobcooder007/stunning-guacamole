import { Exclude } from 'class-transformer';

export abstract class ValueObject<T> {
  @Exclude()
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * EQUALS: Comparación por valor
   * Se coloca en la base para que todos los hijos lo hereden.
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false;
    if (vo.props === undefined) return false;

    if (typeof this.props !== 'object') {
      return this.props === vo.props;
    }

    // Comparamos las props internamente
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
    // Nota: Usar lodash.isEqual es más seguro para objetos con llaves desordenadas
  }

  /**
   * GET VALUE: Acceso al valor interno
   * Útil para lógica de negocio (ej. guardar en DB o validaciones)
   */
  public get value(): T {
    return this.props;
  }

  public unpack(): T {
    return this.props;
  }

  /**
   * TOJSON: La lógica de serialización que ya refinamos
   * Evita el error 500 y maneja anidación.
   */
  public toJSON(): any {
    if (typeof this.props !== 'object' || this.props === null) {
      return this.props;
    }

    // Si es un VO primitivo envuelto en { value: T }
    if (
      'value' in (this.props as any) &&
      Object.keys(this.props).length === 1
    ) {
      return this.resolveValue((this.props as any).value);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(this.props)) {
      result[key] = this.resolveValue(value);
    }
    return result;
  }

  private resolveValue(val: any): any {
    if (val instanceof ValueObject) return val.toJSON();
    if (Array.isArray(val)) return val.map((i) => this.resolveValue(i));
    return val;
  }
}
