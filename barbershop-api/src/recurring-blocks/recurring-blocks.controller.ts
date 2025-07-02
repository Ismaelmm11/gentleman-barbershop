// barbershop-api/src/recurring-blocks/recurring-blocks.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RecurringBlocksService } from './recurring-blocks.service';
import { CreateRecurringBlockDto } from './dto/create-recurring-block.dto';
import { UpdateRecurringBlockDto } from './dto/update-recurring-block.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
// Al no haber ninguna ruta pública declaramos aqui los Roles, de esta manera solo usuarios registrados pueden acceder a esta ruta.
@Roles('ADMIN', 'BARBERO', 'TATUADOR')
@Controller('recurring-blocks')
export class RecurringBlocksController {
  constructor(private readonly recurringBlocksService: RecurringBlocksService) {}

  @Post()
  create(
    @GetUser() user: { userId: number },
    @Body() createRecurringBlockDto: CreateRecurringBlockDto,
  ) {
    return this.recurringBlocksService.create(user.userId, createRecurringBlockDto);
  }

  @Get()
  findAllForUser(@GetUser() user: { userId: number }) {
    return this.recurringBlocksService.findAllForUser(user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number },
    @Body() updateRecurringBlockDto: UpdateRecurringBlockDto,
  ) {
    return this.recurringBlocksService.update(id, user.userId, updateRecurringBlockDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number }
  ) {
    return this.recurringBlocksService.remove(id, user.userId);
  }
}
