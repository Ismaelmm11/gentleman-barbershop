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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const database_provider_1 = require("../database/database.provider");
const brands_service_1 = require("../brands/brands.service");
const categories_service_1 = require("../categories/categories.service");
let ProductsService = class ProductsService {
    db;
    brandsService;
    categoriesService;
    constructor(db, brandsService, categoriesService) {
        this.db = db;
        this.brandsService = brandsService;
        this.categoriesService = categoriesService;
    }
    async create(createProductDto) {
        const { media, id_marca, id_categoria, ...productData } = createProductDto;
        await this.brandsService.findOne(id_marca);
        await this.categoriesService.findOne(id_categoria);
        const existingProduct = await this.db
            .selectFrom('producto')
            .select('id')
            .where('nombre', '=', productData.nombre)
            .executeTakeFirst();
        if (existingProduct) {
            throw new common_1.ConflictException('Ya existe un producto con este nombre.');
        }
        if (!media || media.length === 0) {
            throw new common_1.BadRequestException('Se requiere al menos un medio (imagen o video) para crear un producto.');
        }
        const newProduct = await this.db.transaction().execute(async (trx) => {
            const result = await trx
                .insertInto('producto')
                .values({
                ...productData,
                id_marca,
                id_categoria,
            })
                .executeTakeFirstOrThrow();
            const newProductId = Number(result.insertId);
            const mediaValues = media.map((m) => ({
                id_producto: newProductId,
                url: m.url,
                tipo: m.tipo,
                es_principal: m.es_principal,
            }));
            await trx.insertInto('media').values(mediaValues).execute();
            return newProductId;
        });
        return this.findOne(newProduct);
    }
    async findAll(query) {
        const { limit = 10, page = 1, nombre, id_marca, id_categoria } = query;
        let queryBuilder = this.db.selectFrom('producto').selectAll();
        if (nombre) {
            queryBuilder = queryBuilder.where('nombre', 'like', `%${nombre}%`);
        }
        if (id_marca) {
            queryBuilder = queryBuilder.where('id_marca', '=', id_marca);
        }
        if (id_categoria) {
            queryBuilder = queryBuilder.where('id_categoria', '=', id_categoria);
        }
        return await queryBuilder
            .limit(limit)
            .offset((page - 1) * limit)
            .execute();
    }
    async findOne(id) {
        const product = await this.db
            .selectFrom('producto')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado.`);
        }
        const media = await this.db
            .selectFrom('media')
            .selectAll()
            .where('id_producto', '=', id)
            .execute();
        return { ...product, media };
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        const { media_a_anadir, media_ids_a_eliminar, ...productDataToUpdate } = updateProductDto;
        await this.db.transaction().execute(async (trx) => {
            const dataToUpdate = Object.entries(productDataToUpdate).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            if (Object.keys(dataToUpdate).length > 0) {
                await trx
                    .updateTable('producto')
                    .set(dataToUpdate)
                    .where('id', '=', id)
                    .execute();
            }
            if (media_ids_a_eliminar && media_ids_a_eliminar.length > 0) {
                await trx
                    .deleteFrom('media')
                    .where('id_producto', '=', id)
                    .where('id', 'in', media_ids_a_eliminar)
                    .execute();
            }
            if (media_a_anadir && media_a_anadir.length > 0) {
                const mediaValues = media_a_anadir.map((m) => ({
                    id_producto: id,
                    url: m.url,
                    tipo: m.tipo,
                    es_principal: m.es_principal,
                }));
                await trx.insertInto('media').values(mediaValues).execute();
            }
        });
        return this.findOne(id);
    }
    async remove(id) {
        const productToDelete = await this.findOne(id);
        const result = await this.db
            .deleteFrom('producto')
            .where('id', '=', id)
            .executeTakeFirst();
        if (result.numDeletedRows === 0n) {
            throw new common_1.NotFoundException(`No se pudo eliminar el producto con ID ${id} porque no fue encontrado.`);
        }
        return { message: `Producto "${productToDelete.nombre}" eliminado con éxito.` };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_provider_1.DATABASE_TOKEN)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => brands_service_1.BrandsService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => categories_service_1.CategoriesService))),
    __metadata("design:paramtypes", [kysely_1.Kysely,
        brands_service_1.BrandsService,
        categories_service_1.CategoriesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map