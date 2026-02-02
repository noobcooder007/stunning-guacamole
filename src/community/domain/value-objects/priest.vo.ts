import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface PriestProps {
  firstname: string;
  firstLastname: string;
  secondLastname: string;
}

export class Priest extends ValueObject<PriestProps> {
  private constructor(props: PriestProps) {
    GeneralGuard.againstNullOrUndefined(
      props.firstname,
      'Firstname is required',
      Priest.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.firstLastname,
      'FirstLastname is required',
      Priest.name,
    );
    super(props);
  }

  get firstname(): string {
    return this.unpack().firstname;
  }

  get firstLastname(): string {
    return this.unpack().firstLastname;
  }

  get secondLastname(): string {
    return this.unpack().secondLastname;
  }

  public static of(props: PriestProps) {
    return new Priest(props);
  }

  public updateWith(props: PriestProps) {
    const current = this.unpack();
    const nextPriest = Priest.of({
      firstname: props.firstname ?? current.firstname,
      firstLastname: props.firstLastname ?? current.firstLastname,
      secondLastname: props.secondLastname ?? current.secondLastname,
    });
    return this.equals(nextPriest) ? this : nextPriest;
  }
}
