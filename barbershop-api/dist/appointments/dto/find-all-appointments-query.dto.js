"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindAllAppointmentsQueryDto = void 0;
const class_validator_1 = require("class-validator");
class FindAllAppointmentsQueryDto {
    id_barbero;
    fecha_desde;
    fecha_hasta;
}
exports.FindAllAppointmentsQueryDto = FindAllAppointmentsQueryDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El id_barbero es obligatorio.' }),
    (0, class_validator_1.IsNumberString)({}, { message: 'El id_barbero debe ser un número.' }),
    __metadata("design:type", String)
], FindAllAppointmentsQueryDto.prototype, "id_barbero", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de inicio del rango es obligatoria.' }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de inicio debe ser una fecha válida.' }),
    __metadata("design:type", String)
], FindAllAppointmentsQueryDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de fin del rango es obligatoria.' }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de fin debe ser una fecha válida.' }),
    __metadata("design:type", String)
], FindAllAppointmentsQueryDto.prototype, "fecha_hasta", void 0);
//# sourceMappingURL=find-all-appointments-query.dto.js.map