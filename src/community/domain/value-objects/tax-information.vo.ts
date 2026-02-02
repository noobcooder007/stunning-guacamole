import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface TaxInformationProps {
  readonly rfc: string;
  readonly rfcHash: string;
  readonly registeredName: string;
  readonly person: string;
}

export class TaxInformation extends ValueObject<TaxInformationProps> {
  private constructor(props: TaxInformationProps) {
    super(props);
  }

  public get rfc() {
    return this.props.rfc;
  }

  public get rfcHash() {
    return this.props.rfcHash;
  }

  public get registeredName() {
    return this.props.registeredName;
  }

  public get person() {
    return this.props.person;
  }

  public static of(props: TaxInformationProps): TaxInformation {
    return new TaxInformation(props);
  }

  public updateWith(props: TaxInformationProps): TaxInformation {
    const current = this.unpack();
    const nextTaxInformation = TaxInformation.of({
      rfc: props.rfc ?? current.rfc,
      rfcHash: props.rfcHash ?? current.rfcHash,
      registeredName: props.registeredName ?? current.registeredName,
      person: props.person ?? current.person,
    });
    return this.equals(nextTaxInformation) ? this : nextTaxInformation;
  }
}
