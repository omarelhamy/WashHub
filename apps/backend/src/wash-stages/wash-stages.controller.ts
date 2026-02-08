import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { WashStagesService } from './wash-stages.service';
import { CreateWashStageDto } from './dto/create-wash-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { WashStageType } from '../entities/wash-stage.entity';

@Controller('wash-stages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN', 'PROVIDER_WORKER')
export class WashStagesController {
  constructor(private readonly service: WashStagesService) {}

  @Post()
  create(
    @Body() dto: CreateWashStageDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.create(dto.washJobId, dto.stage as WashStageType, pid);
  }

  @Get()
  findByJob(
    @Query('washJobId') washJobId: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid || !washJobId) throw new Error('washJobId and providerId required');
    return this.service.findByJob(washJobId, pid);
  }
}
