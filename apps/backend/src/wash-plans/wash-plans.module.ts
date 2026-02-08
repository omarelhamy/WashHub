import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { WashPlansService } from './wash-plans.service';
import { WashPlansController } from './wash-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WashPlan, ClientWashPlan])],
  controllers: [WashPlansController],
  providers: [WashPlansService],
  exports: [WashPlansService],
})
export class WashPlansModule {}
