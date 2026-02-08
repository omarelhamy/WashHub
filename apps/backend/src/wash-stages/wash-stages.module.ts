import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WashStage } from '../entities/wash-stage.entity';
import { WashJob } from '../entities/wash-job.entity';
import { WashStagesService } from './wash-stages.service';
import { WashStagesController } from './wash-stages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WashStage, WashJob])],
  controllers: [WashStagesController],
  providers: [WashStagesService],
  exports: [WashStagesService],
})
export class WashStagesModule {}
