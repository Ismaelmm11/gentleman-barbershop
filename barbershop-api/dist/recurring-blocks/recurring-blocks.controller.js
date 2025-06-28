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
exports.RecurringBlocksController = void 0;
const common_1 = require("@nestjs/common");
const recurring_blocks_service_1 = require("./recurring-blocks.service");
const create_recurring_block_dto_1 = require("./dto/create-recurring-block.dto");
const update_recurring_block_dto_1 = require("./dto/update-recurring-block.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
let RecurringBlocksController = class RecurringBlocksController {
    recurringBlocksService;
    constructor(recurringBlocksService) {
        this.recurringBlocksService = recurringBlocksService;
    }
    create(user, createRecurringBlockDto) {
        return this.recurringBlocksService.create(user.userId, createRecurringBlockDto);
    }
    findAllForUser(user) {
        return this.recurringBlocksService.findAllForUser(user.userId);
    }
    update(id, user, updateRecurringBlockDto) {
        return this.recurringBlocksService.update(id, user.userId, updateRecurringBlockDto);
    }
    remove(id, user) {
        return this.recurringBlocksService.remove(id, user.userId);
    }
};
exports.RecurringBlocksController = RecurringBlocksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_recurring_block_dto_1.CreateRecurringBlockDto]),
    __metadata("design:returntype", void 0)
], RecurringBlocksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecurringBlocksController.prototype, "findAllForUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, update_recurring_block_dto_1.UpdateRecurringBlockDto]),
    __metadata("design:returntype", void 0)
], RecurringBlocksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RecurringBlocksController.prototype, "remove", null);
exports.RecurringBlocksController = RecurringBlocksController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'BARBERO', 'TATUADOR'),
    (0, common_1.Controller)('recurring-blocks'),
    __metadata("design:paramtypes", [recurring_blocks_service_1.RecurringBlocksService])
], RecurringBlocksController);
//# sourceMappingURL=recurring-blocks.controller.js.map