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
exports.CreateProductDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const product_media_dto_1 = require("./product-media.dto");
class CreateProductDto {
    nombre;
    descripcion;
    precio;
    id_marca;
    id_categoria;
    media;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser un texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre no puede estar vacío.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser un texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La descripción no puede estar vacía.' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El precio debe ser un número.' }),
    (0, class_validator_1.IsPositive)({ message: 'El precio debe ser un número positivo.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "precio", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la marca debe ser un número.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "id_marca", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la categoría debe ser un número.' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "id_categoria", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Los medios deben ser un array.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => product_media_dto_1.ProductMediaDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "media", void 0);
//# sourceMappingURL=create-product.dto.js.map