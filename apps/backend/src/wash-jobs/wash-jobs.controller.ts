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
import { CreateWashJobCommentDto } from './dto/create-wash-job-comment.dto';
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

  @Post('generate-today')
  @Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
  generateToday(@Query('date') dateStr?: string) {
    const date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? new Date(dateStr + 'T12:00:00.000Z')
      : new Date();
    return this.service.generateDailyJobsForDate(date);
  }

  @Post('generate-month')
  @Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
  generateMonth(
    @Query('month') monthStr: string,
    @Query('clientId') clientId: string | undefined,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) throw new Error('month required (YYYY-MM)');
    return this.service.generateMonthJobs(pid, monthStr, clientId || undefined);
  }

  @Get()
  findAll(
    @Query('providerId') providerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: 'scheduledAt' | 'status' | 'clientName' | 'carPlate',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Req() req?: { user: JwtPayload },
  ) {
    const pid = providerId || (req?.user && getProviderIdFromUser(req.user));
    if (!pid) throw new Error('providerId required');
    const validSortBy = ['scheduledAt', 'status', 'clientName', 'carPlate'].includes(sortBy || '') ? sortBy : 'scheduledAt';
    const validOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';
    return this.service.findAll(
      pid,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      date,
      dateFrom,
      dateTo,
      validSortBy,
      validOrder,
    );
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Query('providerId') providerId: string, @Req() req: { user: JwtPayload }) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.getComments(id, pid);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateWashJobCommentDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.addComment(id, dto.text, pid);
  }

  @Patch(':id/comments/:commentId')
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateWashJobCommentDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.updateComment(id, commentId, dto.text, pid);
  }

  @Delete(':id/comments/:commentId')
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.deleteComment(id, commentId, pid);
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
