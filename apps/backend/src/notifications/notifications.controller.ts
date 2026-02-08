import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterFcmDto } from './dto/register-fcm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Roles('CLIENT', 'SUPER_ADMIN', 'PROVIDER_ADMIN')
  findByClient(
    @Query('clientId') clientId: string,
    @Query('providerId') providerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: { user: JwtPayload },
  ) {
    const pid = providerId || (req?.user && getProviderIdFromUser(req.user));
    const cid = clientId || (req?.user?.type === 'CLIENT' ? req?.user?.sub : undefined);
    if (!cid || !pid) throw new Error('clientId and providerId required');
    return this.service.findByClient(cid, pid, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Post('fcm/register')
  @Roles('CLIENT')
  registerFcm(
    @Body() dto: RegisterFcmDto,
    @Req() req: { user: JwtPayload },
  ) {
    const clientId = req.user.sub;
    return this.service.registerFcmToken(clientId, dto.token, dto.deviceId, dto.platform);
  }
}
