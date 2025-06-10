// barbershop-api/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Nueva ruta para nuestro chequeo de salud.
  // Cuando alguien visite GET /health, se ejecutará este método.
  @Get('health')
  checkHealth() {
    return this.appService.checkDbConnection();
  }
}
