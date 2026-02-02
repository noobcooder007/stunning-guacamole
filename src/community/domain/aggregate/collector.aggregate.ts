import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { ErrorType } from '@/shared/domain/dto/result.dto';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { Address } from '@/community/domain/value-objects/address.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { NSS } from '@/community/domain/value-objects/nss.vo';
import { PaymentData } from '@/community/domain/value-objects/payment-data.vo';
import { AssignationId } from '@/community/domain/aggregate/assignation.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { DesactivateAssignationsEvent } from '@/community/application/events/desactivate-assignation.event';

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
  firstname: string;
  firstLastname: string;
  secondLastname?: string | null;
  nss: NSS;
  nssHash: string;
  address: Address;
  addressHash: string;
  phoneNumber: PhoneNumber;
  phoneNumberHash: string;
  telephoneNumber?: PhoneNumber;
  telephoneNumberHash?: string;
  paymentData: PaymentData;
  assignations?: Set<AssignationId>;
  notes?: string;
  createdAt: Date;
  isActive: boolean;
  profilePath: string;
}

export class Collector extends AggregateRoot {
  private constructor(
    private readonly id: CollectorId,
    private props: CollectorProps,
  ) {
    super();
    GeneralGuard.againstNullOrUndefined(
      props.firstname,
      'Firstname is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.firstLastname,
      'FirstLastname is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.nss,
      'NSS is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.address,
      'Address is required',
      Collector.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.phoneNumber,
      'Phone number is required',
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
    return new Collector(id, props);
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

  public get firstname(): string {
    return this.props.firstname;
  }

  public get firstLastname(): string {
    return this.props.firstLastname;
  }

  public get secondLastname(): string | null {
    return this.props.secondLastname;
  }

  public get nss(): NSS {
    return this.props.nss;
  }

  public get nssHash(): string {
    return this.props.nssHash;
  }

  public get address(): Address {
    return this.props.address;
  }

  public get addressHash(): string {
    return this.props.addressHash;
  }

  public get phoneNumber(): PhoneNumber {
    return this.props.phoneNumber;
  }

  public get phoneNumberHash(): string {
    return this.props.phoneNumberHash;
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

  public desactivate() {
    this.props.isActive = false;
    const assignationsAffected = Array.from(this.props.assignations).map((a) =>
      a.unpack(),
    );
    this.props.assignations.clear();
    this.apply(
      new DesactivateAssignationsEvent(
        this.id.unpack(),
        assignationsAffected,
        'Collector desactivated',
      ),
    );
  }

  public removeAssignation(assignationId: AssignationId, reason: string) {
    if (!this.props.assignations.has(assignationId))
      throw new DomainException(
        'Assignation not found',
        Collector.name,
        ErrorType.VALIDATION,
      );
    this.props.assignations.delete(assignationId);
    this.apply(
      new DesactivateAssignationsEvent(
        this.id.unpack(),
        [assignationId.unpack()],
        reason,
      ),
    );
  }

  public async updateNSSHash(nssHash: string) {
    this.props.nssHash = nssHash;
  }

  public async updateAddressHash(addressHash: string) {
    this.props.addressHash = addressHash;
  }

  public async updatePhoneNumberHash(phoneNumberHash: string) {
    this.props.phoneNumberHash = phoneNumberHash;
  }

  public async updateTelephoneNumberHash(telephoneNumberHash: string) {
    this.props.telephoneNumberHash = telephoneNumberHash;
  }
}
