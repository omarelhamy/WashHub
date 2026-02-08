import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WashJob } from '../entities/wash-job.entity';
import { WashJobComment } from '../entities/wash-job-comment.entity';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { Car } from '../entities/car.entity';
import { WashJobsService } from './wash-jobs.service';
import { WashJobsController } from './wash-jobs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WashJob, WashJobComment, WashPlan, ClientWashPlan, Car]),
  ],
  controllers: [WashJobsController],
  providers: [WashJobsService],
  exports: [WashJobsService],
})
export class WashJobsModule {}
