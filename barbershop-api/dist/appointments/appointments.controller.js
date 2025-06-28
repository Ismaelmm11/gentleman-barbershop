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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const appointments_service_1 = require("./appointments.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const update_appointment_dto_1 = require("./dto/update-appointment.dto");
const request_returning_appointment_dto_1 = require("./dto/request-returning-appointment.dto");
const request_new_appointment_dto_1 = require("./dto/request-new-appointment.dto");
const confirm_appointment_dto_1 = require("./dto/confirm-appointment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    requestForReturningClient(requestDto) {
        return this.appointmentsService.requestForReturningClient(requestDto);
    }
    requestForNewClient(requestDto) {
        return this.appointmentsService.requestForNewClient(requestDto);
    }
    confirmAppointment(confirmDto) {
        return this.appointmentsService.confirmAppointment(confirmDto);
    }
    createInternal(creator, createAppointmentDto) {
        return this.appointmentsService.createInternal(creator.userId, createAppointmentDto);
    }
    findAll() {
        return this.appointmentsService.findAll();
    }
    findOne(id) {
        return this.appointmentsService.findOne(+id);
    }
    update(id, updateAppointmentDto) {
        return this.appointmentsService.update(+id, updateAppointmentDto);
    }
    remove(id) {
        return this.appointmentsService.remove(+id);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('request-returning'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_returning_appointment_dto_1.RequestReturningAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "requestForReturningClient", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('request-new'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_new_appointment_dto_1.RequestNewAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "requestForNewClient", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_appointment_dto_1.ConfirmAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "confirmAppointment", null);
__decorate([
    (0, common_1.Post)('internal'),
    (0, roles_decorator_1.Roles)('ADMIN', 'BARBERO', 'TATUADOR'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "createInternal", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'BARBERO'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'BARBERO'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'BARBERO'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_appointment_dto_1.UpdateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'BARBERO'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "remove", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('appointments'),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map