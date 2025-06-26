"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsMultipleOfConstraint = void 0;
exports.IsMultipleOf = IsMultipleOf;
const class_validator_1 = require("class-validator");
let IsMultipleOfConstraint = class IsMultipleOfConstraint {
    validate(value, args) {
        if (typeof value !== 'number')
            return false;
        const [divisor] = args.constraints;
        return value % divisor === 0;
    }
    defaultMessage(args) {
        const [divisor] = args.constraints;
        return `${args.property} debe ser un múltiplo de ${divisor}.`;
    }
};
exports.IsMultipleOfConstraint = IsMultipleOfConstraint;
exports.IsMultipleOfConstraint = IsMultipleOfConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], IsMultipleOfConstraint);
function IsMultipleOf(divisor, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [divisor],
            validator: IsMultipleOfConstraint,
        });
    };
}
//# sourceMappingURL=is-multiple-of.decorator.js.map