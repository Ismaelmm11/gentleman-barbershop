// En: barbershop-api/src/common/decorators/is-multiple-of.decorator.ts

import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMultipleOfConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        if (typeof value !== 'number') return false; // Funciona con números
        const [divisor] = args.constraints;
        return value % divisor === 0;
    }

    defaultMessage(args: ValidationArguments) {
        const [divisor] = args.constraints;
        return `${args.property} debe ser un múltiplo de ${divisor}.`;
    }
}

export function IsMultipleOf(divisor: number, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [divisor],
            validator: IsMultipleOfConstraint,
        });
    };
}