// barbershop-api/src/media/media.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Importamos el objeto `v2` directamente desde la librería oficial de cloudinary.
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {
    // Configuramos la librería de Cloudinary de forma explícita al iniciar el servicio.
    // Leemos las credenciales directamente desde el ConfigService, que a su vez
    // las ha cargado desde nuestro archivo .env.
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Sube un archivo (imagen o vídeo) a Cloudinary.
   * @param file - El archivo recibido en la petición.
   * @returns Un objeto con la información del archivo subido.
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      // CORRECCIÓN: En lugar de pasar la ruta del archivo (que puede no existir si se usa
      // memory storage), convertimos el buffer del archivo a un Data URI string.
      // Cloudinary puede procesar este formato directamente.
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'gentleman-barbershop',
        resource_type: 'auto', // Dejamos que Cloudinary detecte si es imagen o vídeo.
      });

      return result;
      
    } catch (error) {
      console.error('Error al subir el archivo a Cloudinary:', error);
      throw new InternalServerErrorException('Error al subir el archivo.');
    }
  }
}
