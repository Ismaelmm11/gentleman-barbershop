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
exports.UpdateProductDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const mapped_types_1 = require("@nestjs/mapped-types");
const create_product_dto_1 = require("./create-product.dto");
const product_media_dto_1 = require("./product-media.dto");
class ProductDataDto extends (0, mapped_types_1.PartialType)(create_product_dto_1.CreateProductDto) {
    media;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", void 0)
], ProductDataDto.prototype, "media", void 0);
class UpdateProductDto extends ProductDataDto {
    media_a_anadir;
    media_ids_a_eliminar;
}
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Los medios a añadir deben ser un array.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => product_media_dto_1.ProductMediaDto),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "media_a_anadir", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Los IDs a eliminar deben ser un array.' }),
    (0, class_validator_1.IsNumber)({}, { each: true, message: 'Cada ID a eliminar debe ser un número.' }),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "media_ids_a_eliminar", void 0);
//# sourceMappingURL=update-product.dto.js.map