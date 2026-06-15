import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { Address } from '@/community/domain/value-objects/address.vo';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { TaxInformation } from '@/community/domain/value-objects/tax-information.vo';
import { BeneficientDeactivatedEvent } from '@/community/application/events/beneficient-deactivated.event';
import {
  UpdateBeneficientAddressCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientPersonalCommand,
  UpdateBeneficientPrivacyCommand,
  UpdateBeneficientTaxCommand,
} from '@/community/application/command/update-beneficient.command';

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
    return new BeneficientId(uuidv7());
  }

  public static of(value: string): BeneficientId {
    GeneralGuard.againstValueIsUUID(value, BeneficientId.name);
    return new BeneficientId(value);
  }
}

export interface BeneficientProps {
  title: string;
  firstname: string;
  firstLastname: string;
  secondLastname: string;
  birthday: Date;
  weddingAniversary?: Date | null;
  genre: string;
  maritalStatus: string;
  address: Address;
  addressHash: string;
  church: ChurchId;
  keepPrivate: boolean;
  phoneNumber?: string;
  phoneNumberHash?: string;
  email?: string;
  emailHash?: string;
  taxInformation?: TaxInformation;
  createdAt?: Date;
  isActive?: boolean;
  reasonDeactivated?: string;
  deactivatedAt?: Date | null;
  beneficientNumber?: number;
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
      deactivatedAt: null,
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

  public get addressHash(): string {
    return this.props.addressHash;
  }

  public get church(): ChurchId {
    return this.props.church;
  }

  public get email(): string | null {
    return this.props.email;
  }

  public get emailHash(): string | null {
    return this.props.emailHash;
  }

  public get phoneNumber(): string | null {
    return this.props.phoneNumber;
  }

  public get phoneNumberHash(): string | null {
    return this.props.phoneNumberHash;
  }

  public get keepPrivate(): boolean {
    return this.props.keepPrivate;
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

  public get deactivatedAt(): Date | null {
    return this.props.deactivatedAt ?? null;
  }

  public get beneficientNumber(): number {
    return this.props.beneficientNumber;
  }

  public update(command: UpdateBeneficientCommand) {
    if (command instanceof UpdateBeneficientPersonalCommand) {
      this.props = {
        ...this.props,
        title: command.title ?? this.props.title,
        firstname: command.firstname ?? this.props.firstname,
        firstLastname: command.firstLastname ?? this.props.firstLastname,
        secondLastname:
          command.secondLastname !== undefined
            ? command.secondLastname
            : this.props.secondLastname,
        birthday: command.birthday ?? this.props.birthday,
        genre: command.genre ?? this.props.genre,
        maritalStatus: command.maritalStatus ?? this.props.maritalStatus,
        weddingAniversary:
          command.weddingAnniversary !== undefined
            ? command.weddingAnniversary
            : this.props.weddingAniversary,
      };
    } else if (command instanceof UpdateBeneficientAddressCommand) {
      this.props.address = this.address.updateWith(command);
      this.props.addressHash = command.addressHash;
    } else if (command instanceof UpdateBeneficientContactCommand) {
      if (command.email !== undefined) {
        this.props.email = command.email;
        this.props.emailHash = command.emailHash;
      }
      if (command.phoneNumber !== undefined) {
        this.props.phoneNumber = command.phoneNumber;
        this.props.phoneNumberHash = command.phoneNumberHash;
      }
    } else if (command instanceof UpdateBeneficientChurchCommand) {
      this.props.church = ChurchId.of(command.churchId);
    } else if (command instanceof UpdateBeneficientTaxCommand) {
      if (command.person === null) {
        this.props.taxInformation = null;
      } else {
        this.props.taxInformation = this.props.taxInformation
          ? this.props.taxInformation.updateWith({
              person: command.person ?? this.props.taxInformation.person,
              registeredName:
                command.registeredName ??
                this.props.taxInformation.registeredName,
              rfc: command.rfc ?? this.props.taxInformation.rfc,
              rfcHash: command.rfcHash ?? this.props.taxInformation.rfcHash,
            })
          : TaxInformation.of({
              person: command.person,
              registeredName: command.registeredName,
              rfc: command.rfc,
              rfcHash: command.rfcHash,
            });
      }
    } else if (command instanceof UpdateBeneficientPrivacyCommand) {
      this.props.keepPrivate = command.keepPrivate;
    }
  }

  public deactivate(reason: string) {
    this.props = {
      ...this.props,
      isActive: false,
      reasonDeactivated: reason,
      deactivatedAt: new Date(),
    };
    this.apply(new BeneficientDeactivatedEvent(this.id.unpack(), reason));
  }
}
