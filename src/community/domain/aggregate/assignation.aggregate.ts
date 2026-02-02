import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { BeneficientId } from '@/community/domain/aggregate/beneficient.aggregate';
import { CollectorId } from '@/community/domain/aggregate/collector.aggregate';

export class AssignationId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      AssignationId.name,
    );
    super(value);
  }

  public static create(): AssignationId {
    return new AssignationId(uuidv4());
  }

  public static of(value: string): AssignationId {
    GeneralGuard.againstValueIsUUID(value, AssignationId.name);
    return new AssignationId(value);
  }

  public toString(): string {
    return this.value;
  }
}

export interface AssignationProps {
  collectorId: CollectorId;
  beneficientId: BeneficientId;
  reasonDeactivate?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export class Assignation extends AggregateRoot {
  private constructor(
    private readonly id: AssignationId,
    private props: AssignationProps,
  ) {
    super();
  }

  public static create(props: AssignationProps) {
    const id = AssignationId.create();
    const data = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new Assignation(id, data);
  }

  public static recreate(id: string, props: AssignationProps) {
    const participantId = AssignationId.of(id);
    return new Assignation(participantId, props);
  }

  public get _id(): AssignationId {
    return this.id;
  }

  public get beneficientId(): BeneficientId {
    return this.props.beneficientId;
  }

  public get collectorId(): CollectorId {
    return this.props.collectorId;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.createdAt;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get reasonDeactivate(): string | null {
    return this.props.reasonDeactivate;
  }

  public desactivate(reason: string) {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
    this.props.reasonDeactivate = reason;
  }

  public reactivate() {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
    this.props.reasonDeactivate = null;
  }
}
