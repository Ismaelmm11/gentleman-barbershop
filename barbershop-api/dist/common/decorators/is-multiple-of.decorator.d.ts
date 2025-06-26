import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsMultipleOfConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsMultipleOf(divisor: number, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
