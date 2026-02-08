import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { EnrollDto } from './dto/enroll.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('enroll-info')
  getEnrollInfo(@Query('code') code: string) {
    return this.service.getEnrollInfo(code ?? '');
  }

  @Post('enroll')
  enroll(@Body() dto: EnrollDto) {
    return this.service.enroll(dto);
  }
}
