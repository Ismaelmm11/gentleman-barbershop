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
exports.ProductMediaDto = void 0;
const class_validator_1 = require("class-validator");
class ProductMediaDto {
    url;
    es_principal;
    tipo;
}
exports.ProductMediaDto = ProductMediaDto;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'La URL proporcionada no es válida.' }),
    __metadata("design:type", String)
], ProductMediaDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'El campo es_principal debe ser un valor booleano.' }),
    __metadata("design:type", Boolean)
], ProductMediaDto.prototype, "es_principal", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['IMAGEN', 'VIDEO'], {
        message: 'El tipo de medio debe ser IMAGEN o VIDEO.',
    }),
    __metadata("design:type", String)
], ProductMediaDto.prototype, "tipo", void 0);
//# sourceMappingURL=product-media.dto.js.map