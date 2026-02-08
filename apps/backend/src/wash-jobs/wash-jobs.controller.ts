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
import { WashJobsService } from './wash-jobs.service';
import { CreateWashJobDto } from './dto/create-wash-job.dto';
import { UpdateWashJobDto } from './dto/update-wash-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('wash-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN', 'PROVIDER_WORKER')
export class WashJobsController {
  constructor(private readonly service: WashJobsService) {}

  @Post()
  create(
    @Body() dto: CreateWashJobDto,
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
    @Query('date') date?: string,
    @Req() req?: { user: JwtPayload },
  ) {
    const pid = providerId || (req?.user && getProviderIdFromUser(req.user));
    if (!pid) throw new Error('providerId required');
    return this.service.findAll(
      pid,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      date,
    );
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
    @Body() dto: UpdateWashJobDto,
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
