import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { Notification } from '../entities/notification.entity';
import { SchedulerService } from './scheduler.service';
import { WashJobsModule } from '../wash-jobs/wash-jobs.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ClientWashPlan, Notification]),
    WashJobsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
