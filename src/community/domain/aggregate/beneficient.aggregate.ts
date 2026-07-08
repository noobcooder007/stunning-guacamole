import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { ChurchId } from '@/community/domain/aggregate/church.aggregate';
import { TaxInformation } from '@/community/domain/value-objects/tax-information.vo';
import {
  Profile,
  ProfileId,
} from '@/community/domain/aggregate/profile.aggregate';
import { BeneficientDeactivatedEvent } from '@/community/application/events/beneficient-deactivated.event';
import {
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
  profileId: ProfileId;
  profile: Profile;
  birthday: Date;
  weddingAniversary?: Date | null;
  genre: string;
  maritalStatus: string;
  church: ChurchId;
  keepPrivate: boolean;
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
      props.profileId,
      'ProfileId is required',
      Beneficient.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.profile,
      'Profile is required',
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

  public get profileId(): ProfileId {
    return this.props.profileId;
  }

  public get profile(): Profile {
    return this.props.profile;
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

  public get church(): ChurchId {
    return this.props.church;
  }

  public get email(): string | null {
    return this.props.email;
  }

  public get emailHash(): string | null {
    return this.props.emailHash;
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
        birthday: command.birthday ?? this.props.birthday,
        genre: command.genre ?? this.props.genre,
        maritalStatus: command.maritalStatus ?? this.props.maritalStatus,
        weddingAniversary:
          command.weddingAnniversary !== undefined
            ? command.weddingAnniversary
            : this.props.weddingAniversary,
      };
    } else if (command instanceof UpdateBeneficientContactCommand) {
      if (command.email !== undefined) {
        this.props.email = command.email;
        this.props.emailHash = command.emailHash;
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
