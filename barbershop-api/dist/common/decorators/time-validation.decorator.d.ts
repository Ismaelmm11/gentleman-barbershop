import { ValidationOptions, ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class IsTimeIn5MinuteIntervalsConstraint implements ValidatorConstraintInterface {
    validate(dateString: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class IsTimeIn30MinuteIntervalsConstraint implements ValidatorConstraintInterface {
    validate(dateString: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsTimeIn5MinuteIntervals(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
export declare function IsTimeIn30MinuteIntervals(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
