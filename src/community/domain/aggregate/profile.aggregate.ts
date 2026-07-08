import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { Address } from '@/community/domain/value-objects/address.vo';
import { PhoneNumber } from '@/community/domain/value-objects/phone-number.vo';
import {
  UpdateProfileAddressCommand,
  UpdateProfileCommand,
  UpdateProfileContactCommand,
  UpdateProfilePersonalCommand,
} from '@/community/application/command/update-profile.command';

export class ProfileId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      ProfileId.name,
    );
    super(value);
  }

  public static create(): ProfileId {
    return new ProfileId(uuidv7());
  }

  public static of(value: string): ProfileId {
    GeneralGuard.againstValueIsUUID(value, ProfileId.name);
    return new ProfileId(value);
  }
}

export interface ProfileProps {
  firstname: string;
  firstLastname: string;
  secondLastname?: string | null;
  address: Address;
  addressHash: string;
  phoneNumber?: PhoneNumber | null;
  phoneNumberHash?: string | null;
  createdAt?: Date;
}

export class Profile {
  private constructor(
    private readonly id: ProfileId,
    private props: ProfileProps,
  ) {
    GeneralGuard.againstNullOrUndefined(
      props.firstname,
      'Firstname is required',
      Profile.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.firstLastname,
      'FirstLastname is required',
      Profile.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.address,
      'Address is required',
      Profile.name,
    );
  }

  public static create(props: ProfileProps): Profile {
    const id = ProfileId.create();
    const data: ProfileProps = {
      ...props,
      createdAt: new Date(),
    };
    return new Profile(id, data);
  }

  public static recreate(id: string, props: ProfileProps): Profile {
    const profileId = ProfileId.of(id);
    return new Profile(profileId, props);
  }

  public get _id(): ProfileId {
    return this.id;
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

  public get address(): Address {
    return this.props.address;
  }

  public get addressHash(): string {
    return this.props.addressHash;
  }

  public get phoneNumber(): PhoneNumber | null {
    return this.props.phoneNumber ?? null;
  }

  public get phoneNumberHash(): string | null {
    return this.props.phoneNumberHash ?? null;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public update(command: UpdateProfileCommand) {
    if (command instanceof UpdateProfilePersonalCommand) {
      this.props = {
        ...this.props,
        firstname: command.firstname ?? this.props.firstname,
        firstLastname: command.firstLastname ?? this.props.firstLastname,
        secondLastname:
          command.secondLastname !== undefined
            ? command.secondLastname
            : this.props.secondLastname,
      };
    } else if (command instanceof UpdateProfileAddressCommand) {
      this.props.address = this.address.updateWith(command);
      this.props.addressHash = command.addressHash;
    } else if (command instanceof UpdateProfileContactCommand) {
      this.props.phoneNumber = command.phoneNumber
        ? PhoneNumber.of(command.phoneNumber)
        : null;
      this.props.phoneNumberHash = command.phoneNumberHash;
    }
  }
}
