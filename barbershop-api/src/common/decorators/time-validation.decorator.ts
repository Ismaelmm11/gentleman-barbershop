// barbershop-api/src/common/decorators/time-validation.decorator.ts
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isTimeIn5MinuteIntervals', async: false })
export class IsTimeIn5MinuteIntervalsConstraint implements ValidatorConstraintInterface {
  validate(dateString: any, args: ValidationArguments) {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    return date.getMinutes() % 5 === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} debe ser en un intervalo de 5 minutos (ej: 10:00, 10:05).`;
  }
}

export function IsTimeIn5MinuteIntervals(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeIn5MinuteIntervalsConstraint,
    });
  };
}

