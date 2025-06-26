"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsTimeIn5MinuteIntervalsConstraint = void 0;
exports.IsTimeIn5MinuteIntervals = IsTimeIn5MinuteIntervals;
const class_validator_1 = require("class-validator");
let IsTimeIn5MinuteIntervalsConstraint = class IsTimeIn5MinuteIntervalsConstraint {
    validate(dateString, args) {
        if (typeof dateString !== 'string')
            return false;
        const date = new Date(dateString);
        if (isNaN(date.getTime()))
            return false;
        return date.getMinutes() % 5 === 0;
    }
    defaultMessage(args) {
        return `${args.property} debe ser en un intervalo de 5 minutos (ej: 10:00, 10:05).`;
    }
};
exports.IsTimeIn5MinuteIntervalsConstraint = IsTimeIn5MinuteIntervalsConstraint;
exports.IsTimeIn5MinuteIntervalsConstraint = IsTimeIn5MinuteIntervalsConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isTimeIn5MinuteIntervals', async: false })
], IsTimeIn5MinuteIntervalsConstraint);
function IsTimeIn5MinuteIntervals(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsTimeIn5MinuteIntervalsConstraint,
        });
    };
}
//# sourceMappingURL=time-validation.decorator.js.map