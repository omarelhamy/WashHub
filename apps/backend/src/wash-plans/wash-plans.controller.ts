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
import { WashPlansService } from './wash-plans.service';
import { CreateWashPlanDto } from './dto/create-wash-plan.dto';
import { UpdateWashPlanDto } from './dto/update-wash-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('wash-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
export class WashPlansController {
  constructor(private readonly service: WashPlansService) {}

  @Post()
  create(
    @Body() dto: CreateWashPlanDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
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
    const user = req?.user;
    const pid = providerId || (user && getProviderIdFromUser(user));
    const isSuperAdmin = user?.type === 'SUPER_ADMIN';
    if (isSuperAdmin) {
      return this.service.findAllForSuperAdmin(pid || undefined, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 100);
    }
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
    @Body() dto: UpdateWashPlanDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.update(id, pid, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.remove(id, pid);
  }

  @Post(':id/enroll/:clientId')
  enroll(
    @Param('id') id: string,
    @Param('clientId') clientId: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.enrollClient(id, clientId, pid);
  }

  @Delete(':id/enroll/:clientId')
  removeEnrollment(
    @Param('id') id: string,
    @Param('clientId') clientId: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.removeEnrollment(id, clientId, pid);
  }

  @Get(':id/enrolled')
  getEnrolled(
    @Param('id') id: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.getEnrolledClients(id, pid);
  }
}
