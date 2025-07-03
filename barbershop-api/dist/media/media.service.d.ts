import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
export declare class MediaService {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
}
