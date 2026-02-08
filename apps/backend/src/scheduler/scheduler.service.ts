import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { Notification } from '../entities/notification.entity';
import { ClientWashPlanStatus } from '../entities/client-wash-plan.entity';
import { WashJobsService } from '../wash-jobs/wash-jobs.service';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(ClientWashPlan)
    private readonly enrollmentRepo: Repository<ClientWashPlan>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly washJobsService: WashJobsService,
  ) {}

  /** Run at 00:05 every day to generate wash jobs for today from subscriptions */
  @Cron('5 0 * * *')
  async generateDailyWashJobs() {
    const result = await this.washJobsService.generateDailyJobsForDate(new Date());
    if (result.created > 0) {
      console.log(`[Scheduler] Generated ${result.created} wash jobs for today`);
    }
  }

  @Cron('0 9 28-31 * *')
  async endOfMonthRenewalReminder() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getMonth() !== now.getMonth()) {
      const enrollments = await this.enrollmentRepo.find({
        where: { status: ClientWashPlanStatus.ACTIVE },
        relations: ['client'],
      });
      for (const e of enrollments) {
        await this.notificationRepo.save(
          this.notificationRepo.create({
            clientId: e.clientId,
            titleKey: 'renewal.reminder.title',
            bodyKey: 'renewal.reminder.body',
          }),
        );
      }
    }
  }
}
