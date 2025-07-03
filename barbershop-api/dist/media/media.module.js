"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_cloudinary_1 = require("nestjs-cloudinary");
const config_1 = require("@nestjs/config");
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./media.service");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_cloudinary_1.CloudinaryModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    isGlobal: true,
                    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
                    api_key: configService.get('CLOUDINARY_API_KEY'),
                    api_secret: configService.get('CLOUDINARY_API_SECRET'),
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService],
        exports: [media_service_1.MediaService],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map