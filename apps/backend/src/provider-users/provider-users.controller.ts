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
import { ProviderUsersService } from './provider-users.service';
import { CreateProviderUserDto } from './dto/create-provider-user.dto';
import { UpdateProviderUserDto } from './dto/update-provider-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser, requireProviderId } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('provider-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
export class ProviderUsersController {
  constructor(private readonly service: ProviderUsersService) {}

  @Post()
  create(@Body() dto: CreateProviderUserDto, @Req() req: { user: JwtPayload }) {
    const pid = getProviderIdFromUser(req.user) ?? dto.providerId;
    if (!pid) throw new Error('providerId required');
    return this.service.create(dto, pid);
  }

  @Get()
  findAll(
    @Query('providerId') providerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: { user: JwtPayload },
  ) {
    const pid = providerId || (req?.user && getProviderIdFromUser(req.user));
    if (!pid) throw new Error('providerId required');
    return this.service.findAll(pid, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
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
    @Body() dto: UpdateProviderUserDto,
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
