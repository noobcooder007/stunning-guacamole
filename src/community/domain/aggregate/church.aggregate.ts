import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { Priest } from '@/community/domain/value-objects/priest.vo';
import {
  Address,
  Numeration,
} from '@/community/domain/value-objects/address.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import { ZipCode } from '@/community/domain/value-objects/zip-code.vo';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';
import {
  UpdateChurchAddressCommand,
  UpdateChurchAuxiliarPriestCommand,
  UpdateChurchCommand,
  UpdateChurchEcclesialIdentityCommand,
  UpdateChurchPhoneNumberCommand,
  UpdateChurchPriestCommand,
} from '@/community/application/command/update-church.command';

export class ChurchId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      ChurchId.name,
    );
    super(value);
  }

  public static create(): ChurchId {
    return new ChurchId(uuidv7());
  }

  public static of(value: string): ChurchId {
    GeneralGuard.againstValueIsUUID(value, ChurchId.name);
    return new ChurchId(value);
  }
}

export interface ChurchProps {
  ecclesialIdentity: EcclesialIdentity;
  address: Address;
  phoneNumber: PhoneNumber;
  priest: Priest;
  auxiliarPriest?: Priest | null;
  isActive: boolean;
  createdAt: Date;
}

export class Church extends AggregateRoot {
  private constructor(
    private readonly id: ChurchId,
    private props: ChurchProps,
  ) {
    super();
    GeneralGuard.againstNullOrUndefined(
      props.ecclesialIdentity,
      'Ecclesial identity is required',
      Church.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.address,
      'Address is required',
      Church.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.phoneNumber,
      'Phone number is required',
      Church.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.priest,
      'Priest is required',
      Church.name,
    );
  }

  public get _id(): ChurchId {
    return this.id;
  }

  public get ecclesialIdentity(): EcclesialIdentity {
    return this.props.ecclesialIdentity;
  }

  public get priest(): Priest {
    return this.props.priest;
  }

  public get auxiliarPriest(): Priest {
    return this.props.auxiliarPriest;
  }

  public get address(): Address {
    return this.props.address;
  }

  public get phoneNumber(): PhoneNumber {
    return this.props.phoneNumber;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public static create(props: ChurchProps) {
    const id = ChurchId.create();
    const data: ChurchProps = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new Church(id, data);
  }

  public static recreate(id: string, props: ChurchProps) {
    const churchId = ChurchId.of(id);
    const data = {
      ...props,
      address: Address.of({
        street: props.address.street,
        numeration: Numeration.of({
          noExt: props.address.numeration.noExt,
          noInt: props.address.numeration.noInt,
        }),
        neighborhood: props.address.neighborhood,
        locality: props.address.locality,
        city: props.address.city,
        state: props.address.state,
        zipCode: ZipCode.of(props.address.zipCode.value),
      }),
      phoneNumber: PhoneNumber.of(props.phoneNumber.unpack()),
    };
    return new Church(churchId, data);
  }

  public update(command: UpdateChurchCommand) {
    if (command instanceof UpdateChurchAddressCommand) {
      this.props.address = this.address.updateWith(command);
    } else if (command instanceof UpdateChurchPriestCommand) {
      this.props.priest = this.priest.updateWith(command);
    } else if (command instanceof UpdateChurchAuxiliarPriestCommand) {
      this.props.auxiliarPriest = this.auxiliarPriest.updateWith(command);
    } else if (command instanceof UpdateChurchEcclesialIdentityCommand) {
      this.props.ecclesialIdentity = this.ecclesialIdentity.updateWith(command);
    } else if (command instanceof UpdateChurchPhoneNumberCommand) {
      this.props.phoneNumber = this.phoneNumber.updateWith(command.phoneNumber);
    }
  }
}
