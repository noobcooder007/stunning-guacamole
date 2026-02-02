import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { TaxInformation } from '@/community/domain/value-objects/tax-information.vo';

export class BeneficientId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      BeneficientId.name,
    );
    super(value);
  }

  public static create() {
    return new BeneficientId(uuidv4());
  }

  public static of(value: string): BeneficientId {
    GeneralGuard.againstValueIsUUID(value, BeneficientId.name);
    return new BeneficientId(value);
  }
}

export interface BeneficientProps {
  readonly title: string;
  readonly firstname: string;
  readonly firstLastname: string;
  readonly secondLastname: string;
  readonly birthday: Date;
  readonly weddingAniversary?: Date | null;
  readonly genre: string;
  readonly maritalStatus: string;
  readonly address: Address;
  readonly church: ChurchId;
  readonly email?: string;
  readonly taxInformation?: TaxInformation;
  readonly createdAt: Date;
  readonly isActive: boolean;
  readonly reasonDeactivated?: string;
}

export class Beneficient extends AggregateRoot {
  private constructor(
    private readonly id: BeneficientId,
    private props: BeneficientProps,
  ) {
    super();
    GeneralGuard.againstNullOrUndefined(
      props.firstname,
      'Firstname is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.firstLastname,
      'FirstLastname is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.birthday,
      'Birthday is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.genre,
      'Genre is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.maritalStatus,
      'MaritalStatus is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.address,
      'Address is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.church,
      'Church is required',
      Beneficient.name,
    );
  }

  public static create(props: BeneficientProps) {
    const id = BeneficientId.create();
    const data: BeneficientProps = {
      ...props,
      createdAt: new Date(),
      isActive: true,
      reasonDeactivated: null,
    };
    return new Beneficient(id, data);
  }

  public static recreate(id: string, props: BeneficientProps) {
    const beneficientId = BeneficientId.of(id);
    return new Beneficient(beneficientId, props);
  }

  public get _id(): BeneficientId {
    return this.id;
  }

  public get title(): string {
    return this.props.title;
  }

  public get firstname(): string {
    return this.props.firstname;
  }

  public get firstLastname(): string {
    return this.props.firstLastname;
  }

  public get secondLastname(): string {
    return this.props.secondLastname;
  }

  public get birthday(): Date {
    return this.props.birthday;
  }

  public get weddingAniversary(): Date | null {
    return this.props.weddingAniversary;
  }

  public get genre(): string {
    return this.props.genre;
  }

  public get maritalStatus(): string {
    return this.props.maritalStatus;
  }

  public get address(): Address {
    return this.props.address;
  }

  public get church(): ChurchId {
    return this.props.church;
  }

  public get email(): string | null {
    return this.props.email;
  }

  public get taxInformation(): TaxInformation | null {
    return this.props.taxInformation;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get reasonDeactivated(): string | null {
    return this.props.reasonDeactivated;
  }

  public updateFields(changes: any) {
    const updatedAddress = Address.of({
      street: changes.street ?? this.props.address.street,
      numeration: Numeration.of({
        noExt: changes.noExt ?? this.props.address.numeration.noExt,
        noInt: changes.noInt ?? this.props.address.numeration.noInt,
      }),
      neighborhood: changes.neighborhood ?? this.props.address.neighborhood,
      locality: changes.locality ?? this.props.address.locality,
      city: changes.city ?? this.props.address.city,
      state: changes.state ?? this.props.address.state,
      zipCode: ZipCode.of(changes.zipCode ?? this.props.address.zipCode),
    });
    this.props = {
      ...this.props,
      ...changes,
      address: updatedAddress.equals(this.props.address)
        ? this.props.address
        : updatedAddress,
      reasonDeactivated: this.props.reasonDeactivated,
      createdAt: this.props.createdAt,
      isActive: this.props.isActive,
    };
  }

  public deactivate(reason: string) {
    this.props = {
      ...this.props,
      isActive: false,
      reasonDeactivated: reason,
    };
  }
}
