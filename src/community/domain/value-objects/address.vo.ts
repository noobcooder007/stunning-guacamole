import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ZipCode } from './zip-code.vo';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface UpdateNumerationInput {
  readonly noExt?: string;
  readonly noInt?: string | null;
}

export interface NumerationProps {
  readonly noExt: string;
  readonly noInt: string | null;
}

export class Numeration extends ValueObject<NumerationProps> {
  private constructor(props: NumerationProps) {
    GeneralGuard.againstNullOrUndefined(
      props.noExt,
      'NoExt is required',
      Numeration.name,
    );
    GeneralGuard.againstBothAreEquals(
      props.noExt,
      props.noInt,
      'NoExt and NoInt are equals',
      Numeration.name,
    );
    super(props);
  }

  public static of(props: NumerationProps): Numeration {
    return new Numeration(props);
  }

  public get noExt(): string {
    return this.props.noExt;
  }

  public get noInt(): string | null {
    return this.props.noInt;
  }

  public equals(numeration: Numeration): boolean {
    return this.noExt === numeration.noExt && this.noInt === numeration.noInt;
  }

  public updateWith(props: UpdateNumerationInput): Numeration {
    const current = this.unpack();
    const nextProps = {
      noExt: props.noExt !== undefined ? current.noExt : current.noExt,
      noInt: props.noInt !== undefined ? current.noInt : current.noInt,
    };
    const nextNumeration = Numeration.of(nextProps);
    return this.equals(nextNumeration) ? this : nextNumeration;
  }
}

export interface UpdateAddressInput {
  readonly street?: string;
  readonly noExt?: string;
  readonly noInt?: string;
  readonly neighborhood?: string;
  readonly locality?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zipCode?: string;
}

export class AddressProps {
  readonly street: string;
  readonly numeration: Numeration;
  readonly neighborhood?: string | null;
  readonly locality?: string | null;
  readonly city: string;
  readonly state: string;
  readonly zipCode: ZipCode;
}

export class Address extends ValueObject<AddressProps> {
  private constructor(props: AddressProps) {
    GeneralGuard.againstNullOrUndefined(
      props.street,
      'Street is required',
      Address.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.numeration,
      'Numeration is required',
      Address.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.city,
      'City is required',
      Address.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.state,
      'State is required',
      Address.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.zipCode,
      'ZipCode is required',
      Address.name,
    );
    GeneralGuard.mutuallyExclusive(
      props.locality,
      props.neighborhood,
      'Only one value should be set for locality or neighborhood',
      Address.name,
    );
    super(props);
  }

  public get street(): string {
    return super.unpack().street;
  }

  public get numeration(): Numeration {
    return this.unpack().numeration;
  }

  public get neighborhood(): string | null {
    return this.unpack().neighborhood;
  }

  public get locality(): string | null {
    return this.unpack().locality;
  }

  public get city(): string {
    return this.unpack().city;
  }

  public get state(): string {
    return this.unpack().state;
  }

  public get zipCode(): ZipCode {
    return this.unpack().zipCode;
  }

  public static of(props: AddressProps): Address {
    return new Address(props);
  }

  public equals(address: Address): boolean {
    return (
      this.street === address.street &&
      this.numeration.equals(address.numeration) &&
      this.neighborhood === address.neighborhood &&
      this.locality === address.locality &&
      this.city === address.city &&
      this.state === address.state &&
      this.zipCode.equals(address.zipCode)
    );
  }

  public updateWith(props: UpdateAddressInput): Address {
    const current = this.unpack();
    const nextNumeration =
      props.noExt !== undefined || props.noInt !== undefined
        ? current.numeration.updateWith({
            noExt: props.noExt,
            noInt: props.noInt,
          })
        : current.numeration;
    const nextZipCode =
      props.zipCode != undefined
        ? current.zipCode.updateWith(props.zipCode)
        : current.zipCode;
    const nextAddress = Address.of({
      street: props.street ?? current.street,
      numeration: nextNumeration,
      neighborhood: props.neighborhood ?? current.neighborhood,
      locality: props.locality ?? current.locality,
      city: props.city ?? current.city,
      state: props.state ?? current.state,
      zipCode: nextZipCode,
    });
    return this.equals(nextAddress) ? this : nextAddress;
  }
}
