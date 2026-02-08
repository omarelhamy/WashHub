import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientCommentsService } from './client-comments.service';
import { CreateClientCommentDto } from './dto/create-client-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('client-comments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN', 'PROVIDER_WORKER')
export class ClientCommentsController {
  constructor(private readonly service: ClientCommentsService) {}

  @Post()
  create(
    @Body() dto: CreateClientCommentDto,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.create(dto, req.user.sub, pid);
  }

  @Get()
  findByClient(
    @Query('clientId') clientId: string,
    @Query('providerId') providerId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid || !clientId) throw new Error('clientId and providerId required');
    return this.service.findByClient(clientId, pid);
  }
}
