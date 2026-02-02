import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface UpdateEcclesialIdentityInput {
  readonly name: string;
  readonly vicaria: string;
  readonly decanato: string;
  readonly parroquia: string;
  readonly capilla: string;
}

export interface EcclesialIdentityProps {
  readonly name: string;
  readonly vicaria: string;
  readonly decanato: string;
  readonly parroquia: string;
  readonly capilla: string;
}

export class EcclesialIdentity extends ValueObject<EcclesialIdentityProps> {
  private constructor(props: EcclesialIdentityProps) {
    super(props);
  }

  public static of(props: EcclesialIdentityProps): EcclesialIdentity {
    return new EcclesialIdentity(props);
  }

  get name(): string {
    return this.props.name;
  }

  get vicaria(): string {
    return this.props.vicaria;
  }

  get decanato(): string {
    return this.props.decanato;
  }

  get parroquia(): string {
    return this.props.parroquia;
  }

  get capilla(): string {
    return this.props.capilla;
  }

  public updateWith(props: UpdateEcclesialIdentityInput): EcclesialIdentity {
    const current = this.unpack();
    const nextEcclesialIdentity = EcclesialIdentity.of({
      name: props.name ?? current.name,
      vicaria: props.vicaria ?? current.vicaria,
      decanato: props.decanato ?? current.decanato,
      parroquia: props.parroquia ?? current.parroquia,
      capilla: props.capilla ?? current.capilla,
    });
    return this.equals(nextEcclesialIdentity) ? this : nextEcclesialIdentity;
  }
}
