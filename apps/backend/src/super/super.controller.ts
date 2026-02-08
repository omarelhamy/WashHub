import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperService } from './super.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('super')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SuperController {
  constructor(private readonly superService: SuperService) {}

  @Get('stats')
  getStats() {
    return this.superService.getStats();
  }
}
