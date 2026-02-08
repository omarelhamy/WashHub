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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  private getProviderId(req: { user: JwtPayload }, queryProviderId?: string) {
    const pid = queryProviderId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return pid;
  }

  @Post()
  create(@Body() dto: CreateClientDto, @Req() req: { user: JwtPayload }) {
    return this.service.create(dto, this.getProviderId(req, dto.providerId));
  }

  @Get()
  findAll(
    @Query('providerId') providerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: { user: JwtPayload },
  ) {
    const user = req?.user;
    const pid = providerId || (user && getProviderIdFromUser(user));
    const isSuperAdmin = user?.type === 'SUPER_ADMIN';
    if (isSuperAdmin) {
      return this.service.findAllForSuperAdmin(pid || undefined, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 50);
    }
    if (!pid) throw new Error('providerId required');
    return this.service.findAll(pid, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('providerId') providerId: string, @Req() req: { user: JwtPayload }) {
    return this.service.findOne(id, this.getProviderId(req, providerId));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    return this.service.update(id, this.getProviderId(req, providerId), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('providerId') providerId: string, @Req() req: { user: JwtPayload }) {
    return this.service.remove(id, this.getProviderId(req, providerId));
  }
}
