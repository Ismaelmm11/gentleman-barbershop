"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRecurringBlockDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_recurring_block_dto_1 = require("./create-recurring-block.dto");
class UpdateRecurringBlockDto extends (0, mapped_types_1.PartialType)(create_recurring_block_dto_1.CreateRecurringBlockDto) {
}
exports.UpdateRecurringBlockDto = UpdateRecurringBlockDto;
//# sourceMappingURL=update-recurring-block.dto.js.map