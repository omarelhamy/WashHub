import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getProviderIdFromUser } from '../common/helpers/tenant.helper';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PROVIDER_ADMIN')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(
    @Body() dto: CreatePaymentDto,
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
    @Query('clientId') clientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: { user: JwtPayload },
  ) {
    const pid = providerId || (req?.user && getProviderIdFromUser(req.user));
    if (!pid) throw new Error('providerId required');
    return this.service.findAll(
      pid,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      clientId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('providerId') providerId: string, @Req() req: { user: JwtPayload }) {
    const pid = providerId || getProviderIdFromUser(req.user);
    if (!pid) throw new Error('providerId required');
    return this.service.findOne(id, pid);
  }
}
