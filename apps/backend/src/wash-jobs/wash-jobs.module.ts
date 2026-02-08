import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WashJob } from '../entities/wash-job.entity';
import { WashJobsService } from './wash-jobs.service';
import { WashJobsController } from './wash-jobs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WashJob])],
  controllers: [WashJobsController],
  providers: [WashJobsService],
  exports: [WashJobsService],
})
export class WashJobsModule {}
