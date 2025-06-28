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
exports.RequestNewAppointmentDto = void 0;
const class_validator_1 = require("class-validator");
const time_validation_decorator_1 = require("../../common/decorators/time-validation.decorator");
class RequestNewAppointmentDto {
    id_barbero;
    id_servicio;
    fecha_hora_inicio;
    nombre_cliente;
    apellidos_cliente;
    fecha_nacimiento_cliente;
    telefono_cliente;
    canal_contacto_cliente;
}
exports.RequestNewAppointmentDto = RequestNewAppointmentDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RequestNewAppointmentDto.prototype, "id_barbero", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RequestNewAppointmentDto.prototype, "id_servicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, time_validation_decorator_1.IsTimeIn5MinuteIntervals)(),
    __metadata("design:type", String)
], RequestNewAppointmentDto.prototype, "fecha_hora_inicio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestNewAppointmentDto.prototype, "nombre_cliente", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestNewAppointmentDto.prototype, "apellidos_cliente", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de nacimiento debe tener el formato YYYY-MM-DD.' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestNewAppointmentDto.prototype, "fecha_nacimiento_cliente", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('ES'),
    __metadata("design:type", String)
], RequestNewAppointmentDto.prototype, "telefono_cliente", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestNewAppointmentDto.prototype, "canal_contacto_cliente", void 0);
//# sourceMappingURL=request-new-appointment.dto.js.map