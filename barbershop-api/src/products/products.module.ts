// src/products/products.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

// --- Importa los módulos de los que dependes ---
import { BrandsModule } from 'src/brands/brands.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    // Añade aquí los módulos para que sus servicios estén disponibles para inyección
    forwardRef(() => CategoriesModule), 
    forwardRef(() => BrandsModule)
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}