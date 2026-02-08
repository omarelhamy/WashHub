import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('cars')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
export class CarsController {
  constructor(private readonly service: CarsService) {}

  @Post()
  create(
    @Body() dto: CreateCarDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.create(dto, pid);
  }

  @Get()
  findAll(
    @Req() req: { user: JwtPayload },
    @Query('clientId') clientId?: string,
    @Query('providerId') providerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.service.findAllByProvider(pid, pageNum, limitNum, clientId || undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('providerId') providerId: string, @Req() req: { user: JwtPayload }) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.findOne(id, pid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCarDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.update(id, pid, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('providerId') providerId: string, @Req() req: { user: JwtPayload }) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.remove(id, pid);
  }
}
