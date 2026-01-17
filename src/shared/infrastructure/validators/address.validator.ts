import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'exactlyOneLocation', async: false })
export class ExactlyOneLocationConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const hasContent = (value: any): boolean => {
      return (
        value !== undefined &&
        value !== null &&
        String(value).trim().length >= 0
      );
    };

    const hasLocalidad = hasContent(obj.locality);
    const hasVecindario = hasContent(obj.neighborhood);

    // XOR estricto:
    // (true, false) => OK
    // (false, true) => OK
    // (true, true)  => FAIL
    // (false, false) => FAIL
    return (hasLocalidad || hasVecindario) && !(hasLocalidad && hasVecindario);
  }

  defaultMessage() {
    return 'locality and neighborhood are mutually exclusive.';
  }
}

export function IsExactlyOneLocation(validationOptions?: ValidationOptions) {
  return function (object: Function) {
    registerDecorator({
      target: object,
      propertyName: 'localidadExclusionCheck', // Propiedad ficticia para el error
      options: validationOptions,
      constraints: [],
      validator: ExactlyOneLocationConstraint,
    });
  };
}
