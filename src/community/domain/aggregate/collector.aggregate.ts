import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import { AssignationId } from '@/community/domain/aggregate/assignation.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import {
  Profile,
  ProfileId,
} from '@/community/domain/aggregate/profile.aggregate';
import { CollectorDeactivatedEvent } from '@/community/application/events/collector-deactivated.event';
import {
  UpdateCollectorCommand,
  UpdateCollectorContactCommand,
  UpdateCollectorNotesCommand,
  UpdateCollectorPaymentCommand,
} from '@/community/application/command/update-collector.command';

export class CollectorId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      CollectorId.name,
    );
    super(value);
  }

  public static create(): CollectorId {
    return new CollectorId(uuidv7());
  }

  public static of(value: string): CollectorId {
    GeneralGuard.againstValueIsUUID(value, CollectorId.name);
    return new CollectorId(value);
  }
}

export interface CollectorProps {
  userId: UserId;
  profileId: ProfileId;
  profile: Profile;
  nss: NSS;
  nssHash: string;
  telephoneNumber?: PhoneNumber;
  telephoneNumberHash?: string;
  paymentData: PaymentData;
  assignations?: Set<AssignationId>;
  notes?: string;
  createdAt?: Date;
  isActive?: boolean;
  profilePath: string;
  collectorNumber?: number;
}

export class Collector extends AggregateRoot {
  private constructor(
    private readonly id: CollectorId,
    private props: CollectorProps,
  ) {
    super();
    GeneralGuard.againstNullOrUndefined(
      props.profileId,
      'ProfileId is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.profile,
      'Profile is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.nss,
      'NSS is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.paymentData,
      'Payment data is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.profilePath,
      'Profile path is required',
      Collector.name,
    );
  }

  public static create(props: CollectorProps) {
    const id = CollectorId.create();
    const data: CollectorProps = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new Collector(id, data);
  }

  public static recreate(id: string, props: CollectorProps) {
    const collectorId = CollectorId.of(id);
    return new Collector(collectorId, props);
  }

  public get _id(): CollectorId {
    return this.id;
  }

  public get userId(): UserId {
    return this.props.userId;
  }

  public get profileId(): ProfileId {
    return this.props.profileId;
  }

  public get profile(): Profile {
    return this.props.profile;
  }

  public get nss(): NSS {
    return this.props.nss;
  }

  public get nssHash(): string {
    return this.props.nssHash;
  }

  public get telephoneNumber(): PhoneNumber | null {
    return this.props.telephoneNumber;
  }

  public get telephoneNumberHash(): string | null {
    return this.props.telephoneNumberHash;
  }

  public get paymentData(): PaymentData {
    return this.props.paymentData;
  }

  public get assignations(): Set<AssignationId> {
    return this.props.assignations;
  }

  public get notes(): string {
    return this.props.notes;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get profilePath(): string {
    return this.props.profilePath;
  }

  public get collectorNumber(): number {
    return this.props.collectorNumber;
  }

  public update(command: UpdateCollectorCommand) {
    if (command instanceof UpdateCollectorContactCommand) {
      if (command.telephoneNumber !== undefined) {
        this.props.telephoneNumber = command.telephoneNumber
          ? PhoneNumber.of(command.telephoneNumber)
          : null;
        this.props.telephoneNumberHash = command.telephoneNumberHash;
      }
    } else if (command instanceof UpdateCollectorPaymentCommand) {
      this.props.paymentData = PaymentData.of({
        commissionPercent:
          command.commissionPercent ?? this.props.paymentData.commissionPercent,
        nomina: command.nomina ?? this.props.paymentData.nomina,
        transportAllowance:
          command.transportAllowance ??
          this.props.paymentData.transportAllowance,
        bank: command.bank ?? this.props.paymentData.bank,
        reference: command.reference ?? this.props.paymentData.reference,
      });
    } else if (command instanceof UpdateCollectorNotesCommand) {
      this.props.notes = command.notes;
    }
  }

  public addAssignation(
    assignations: AssignationId[],
  ): Map<string, AssignationId[]> {
    if (assignations.length === 0) return;
    const notAssigned = [];
    const alreadyAssigned = [];
    const currentAssignations = new Set(
      Array.from(this.props.assignations).map((a) => a.unpack()),
    );
    for (const assignation of assignations) {
      const exists = currentAssignations.has(assignation.unpack());
      if (exists) {
        alreadyAssigned.push(assignation);
        continue;
      }
      if (this.props.assignations.size < 100)
        this.props.assignations.add(assignation);
      else notAssigned.push(assignation);
    }
    return new Map([
      ['alreadyAssigned', alreadyAssigned],
      ['notAssigned', notAssigned],
    ]);
  }

  public deactivate() {
    if (!this.props.isActive) return;
    this.props.isActive = false;
    this.apply(
      new CollectorDeactivatedEvent(this.id.unpack(), 'Collector deactivated'),
    );
  }

  public reactivate() {
    if (this.props.isActive) return;
    this.props.isActive = true;
  }

  public async updateNSSHash(nssHash: string) {
    this.props.nssHash = nssHash;
  }

  public async updateTelephoneNumberHash(telephoneNumberHash: string) {
    this.props.telephoneNumberHash = telephoneNumberHash;
  }
}
