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
exports.CreateAppointmentDto = void 0;
const class_validator_1 = require("class-validator");
const time_validation_decorator_1 = require("../../common/decorators/time-validation.decorator");
const class_transformer_1 = require("class-transformer");
class CreateAppointmentDto {
    id_barbero;
    id_cliente;
    id_servicio;
    fecha_hora_inicio;
    fecha_hora_fin;
    estado;
    precio_final;
    titulo;
}
exports.CreateAppointmentDto = CreateAppointmentDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateAppointmentDto.prototype, "id_barbero", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.estado === 'PENDIENTE'),
    (0, class_validator_1.IsNotEmpty)({ message: 'El id_cliente es obligatorio para las citas pendientes.' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateAppointmentDto.prototype, "id_cliente", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.estado === 'PENDIENTE'),
    (0, class_validator_1.IsNotEmpty)({ message: 'El id_servicio es obligatorio para las citas pendientes.' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateAppointmentDto.prototype, "id_servicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, time_validation_decorator_1.IsTimeIn5MinuteIntervals)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "fecha_hora_inicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, time_validation_decorator_1.IsTimeIn5MinuteIntervals)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "fecha_hora_fin", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PENDIENTE', 'DESCANSO']),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.estado === 'PENDIENTE'),
    (0, class_validator_1.IsNotEmpty)({ message: 'El id_servicio es obligatorio para las citas pendientes.' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAppointmentDto.prototype, "precio_final", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "titulo", void 0);
//# sourceMappingURL=create-appointment.dto.js.map