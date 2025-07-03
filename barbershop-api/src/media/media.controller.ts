// barbershop-api/src/media/media.controller.ts
import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Endpoint para subir un único archivo de imagen.
   * Solo los administradores pueden acceder a esta ruta.
   * @param file - El archivo subido, procesado por Multer.
   */
  @Post('upload')
  @Roles('ADMIN') // Solo los ADMIN pueden subir archivos
  @UseInterceptors(FileInterceptor('file')) // NestJS usa Multer por debajo para manejar form-data
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Verificamos que se ha subido un archivo.
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo.');
    }
    
    // Delegamos la lógica de la subida a nuestro servicio.
    return this.mediaService.uploadFile(file);
  }
}
