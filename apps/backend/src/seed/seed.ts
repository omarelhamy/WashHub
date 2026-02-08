import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PlatformUser } from '../entities/platform-user.entity';
import { Provider } from '../entities/provider.entity';
import { ProviderUser } from '../entities/provider-user.entity';
import { Client } from '../entities/client.entity';
import { Car } from '../entities/car.entity';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { WashJob } from '../entities/wash-job.entity';
import { WashStage } from '../entities/wash-stage.entity';
import { Payment } from '../entities/payment.entity';
import { ClientComment } from '../entities/client-comment.entity';
import { Notification } from '../entities/notification.entity';
import { ProviderUserRole } from '../entities/provider-user.entity';
import { WashPlanLocation } from '../entities/wash-plan.entity';
import { ClientWashPlanStatus } from '../entities/client-wash-plan.entity';
import { WashJobStatus } from '../entities/wash-job.entity';
import { PaymentMethod, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { WashStageType } from '../entities/wash-stage.entity';

const SALT_ROUNDS = 10;

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    entities: [
      PlatformUser,
      Provider,
      ProviderUser,
      Client,
      Car,
      WashPlan,
      ClientWashPlan,
      WashJob,
      WashStage,
      Payment,
      ClientComment,
      Notification,
    ],
  });
  await ds.initialize();

  const platformUserRepo = ds.getRepository(PlatformUser);
  const providerRepo = ds.getRepository(Provider);
  const providerUserRepo = ds.getRepository(ProviderUser);
  const clientRepo = ds.getRepository(Client);
  const carRepo = ds.getRepository(Car);
  const washPlanRepo = ds.getRepository(WashPlan);
  const clientWashPlanRepo = ds.getRepository(ClientWashPlan);
  const washJobRepo = ds.getRepository(WashJob);
  const washStageRepo = ds.getRepository(WashStage);
  const paymentRepo = ds.getRepository(Payment);
  const clientCommentRepo = ds.getRepository(ClientComment);
  const notificationRepo = ds.getRepository(Notification);

  // —— Super Admin ——
  let superAdmin = await platformUserRepo.findOne({ where: { email: 'admin@washhub.com' } });
  if (!superAdmin) {
    const hash = await bcrypt.hash('admin123', SALT_ROUNDS);
    superAdmin = await platformUserRepo.save(
      platformUserRepo.create({ email: 'admin@washhub.com', passwordHash: hash }),
    );
    console.log('Created Super Admin');
  }

  // —— Provider 1: Demo Provider ——
  let provider = await providerRepo.findOne({ where: { name: 'Demo Provider' } });
  if (!provider) {
    provider = await providerRepo.save(
      providerRepo.create({
        name: 'Demo Provider',
        subscriptionPlan: 'FREE_TRIAL',
        subscriptionStatus: 'ACTIVE',
        enabled: true,
      }),
    );
    console.log('Created Provider: Demo Provider');
  }

  // Provider Admin
  let providerAdmin = await providerUserRepo.findOne({
    where: { providerId: provider.id, phone: '+201111111111' },
  });
  if (!providerAdmin) {
    const hash = await bcrypt.hash('provider123', SALT_ROUNDS);
    providerAdmin = await providerUserRepo.save(
      providerUserRepo.create({
        providerId: provider.id,
        name: 'Provider Admin',
        phone: '+201111111111',
        passwordHash: hash,
        role: ProviderUserRole.ADMIN,
      }),
    );
    console.log('Created Provider Admin');
  }

  // Provider Worker
  let providerWorker = await providerUserRepo.findOne({
    where: { providerId: provider.id, phone: '+201000000000' },
  });
  if (!providerWorker) {
    const hash = await bcrypt.hash('worker123', SALT_ROUNDS);
    providerWorker = await providerUserRepo.save(
      providerUserRepo.create({
        providerId: provider.id,
        name: 'Demo Worker',
        phone: '+201000000000',
        passwordHash: hash,
        role: ProviderUserRole.WORKER,
      }),
    );
    console.log('Created Provider Worker');
  }

  // —— Clients + Cars ——
  const clientsData = [
    { name: 'Ahmed Hassan', phone: '+201222222222', code: 'DEMO01', plate: 'ABC-1234', model: 'Toyota Camry', color: 'White' },
    { name: 'Sara Mohamed', phone: '+201333333333', code: 'DEMO02', plate: 'XYZ-5678', model: 'Hyundai Tucson', color: 'Black' },
    { name: 'Omar Khalil', phone: '+201444444444', code: 'DEMO03', plate: 'CAI-9999', model: 'Nissan Sunny', color: 'Silver' },
    { name: 'Nadia Ali', phone: '+201555555555', code: 'DEMO04', plate: 'GIZ-1111', model: 'Chevrolet Spark', color: 'Red' },
    { name: 'Youssef Ibrahim', phone: '+201666666666', code: 'DEMO05', plate: 'ALX-2222', model: null, color: null },
  ];

  const clients: Client[] = [];
  const carsByClient: Map<string, Car[]> = new Map();

  for (const d of clientsData) {
    let client = await clientRepo.findOne({ where: { providerId: provider.id, phone: d.phone } });
    if (!client) {
      client = await clientRepo.save(
        clientRepo.create({
          providerId: provider.id,
          name: d.name,
          phone: d.phone,
          enrolledAt: new Date(),
          enrollmentCode: d.code,
        }),
      );
      const carList: Car[] = [];
      const car = await carRepo.save(
        carRepo.create({
          clientId: client.id,
          plateNumber: d.plate,
          model: d.model,
          color: d.color,
        }),
      );
      carList.push(car);
      carsByClient.set(client.id, carList);
      clients.push(client);
    } else {
      clients.push(client);
      const existingCars = await carRepo.find({ where: { clientId: client.id } });
      carsByClient.set(client.id, existingCars);
    }
  }
  console.log(`Clients + cars: ${clients.length} clients`);

  // —— Wash Plans ——
  const plan1 = await washPlanRepo.findOne({ where: { providerId: provider.id, name: 'Basic Weekly' } }) ?? await washPlanRepo.save(
    washPlanRepo.create({
      providerId: provider.id,
      name: 'Basic Weekly',
      daysOfWeek: [1, 3, 5],
      timesPerWeek: 3,
      location: WashPlanLocation.OUTSIDE,
      washesInPlan: 12,
      periodWeeks: 4,
    }),
  );
  const plan2 = await washPlanRepo.findOne({ where: { providerId: provider.id, name: 'Premium Inside' } }) ?? await washPlanRepo.save(
    washPlanRepo.create({
      providerId: provider.id,
      name: 'Premium Inside',
      daysOfWeek: [2, 4, 6],
      timesPerWeek: 3,
      location: WashPlanLocation.INSIDE,
      washesInPlan: 12,
      periodWeeks: 4,
    }),
  );
  console.log('Wash plans: Basic Weekly, Premium Inside');

  // —— Enroll clients in plans ——
  for (let i = 0; i < Math.min(3, clients.length); i++) {
    const c = clients[i];
    const exists = await clientWashPlanRepo.findOne({ where: { clientId: c.id, washPlanId: plan1.id } });
    if (!exists) {
      await clientWashPlanRepo.save(
        clientWashPlanRepo.create({
          clientId: c.id,
          washPlanId: plan1.id,
          status: ClientWashPlanStatus.ACTIVE,
        }),
      );
    }
  }
  for (let i = 1; i < Math.min(4, clients.length); i++) {
    const c = clients[i];
    const exists = await clientWashPlanRepo.findOne({ where: { clientId: c.id, washPlanId: plan2.id } });
    if (!exists) {
      await clientWashPlanRepo.save(
        clientWashPlanRepo.create({
          clientId: c.id,
          washPlanId: plan2.id,
          status: ClientWashPlanStatus.ACTIVE,
        }),
      );
    }
  }
  console.log('Enrolled clients in plans');

  // —— Wash Jobs (today + past, mixed statuses) ——
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < Math.min(3, clients.length); i++) {
    const client = clients[i];
    const clientCars = carsByClient.get(client.id);
    if (!clientCars?.length) continue;
    const car = clientCars[0];
    const scheduledAt = new Date(today);
    scheduledAt.setHours(9 + i, 30, 0, 0);
    const existing = await washJobRepo.findOne({
      where: { providerId: provider.id, clientId: client.id, carId: car.id, scheduledAt },
    });
    if (!existing) {
      const statuses: WashJobStatus[] = [WashJobStatus.NOT_STARTED, WashJobStatus.IN_PROGRESS, WashJobStatus.COMPLETED];
      const job = await washJobRepo.save(
        washJobRepo.create({
          providerId: provider.id,
          clientId: client.id,
          carId: car.id,
          assignedWorkerId: providerWorker.id,
          status: statuses[i % 3],
          scheduledAt,
          startedAt: i >= 1 ? new Date(scheduledAt.getTime() + 5 * 60000) : null,
          completedAt: i >= 2 ? new Date(scheduledAt.getTime() + 20 * 60000) : null,
        }),
      );
      if (job.status === WashJobStatus.COMPLETED) {
        await washStageRepo.save([
          washStageRepo.create({ washJobId: job.id, stage: WashStageType.ARRIVED }),
          washStageRepo.create({ washJobId: job.id, stage: WashStageType.WASHING }),
          washStageRepo.create({ washJobId: job.id, stage: WashStageType.FINISHING }),
        ]);
      }
    }
  }
  // Past job
  const pastClient = clients[0];
  const pastCar = carsByClient.get(pastClient.id)?.[0];
  if (pastCar) {
    const pastScheduled = new Date(yesterday);
    pastScheduled.setHours(10, 0, 0, 0);
    const pastExists = await washJobRepo.findOne({
      where: { providerId: provider.id, clientId: pastClient.id, scheduledAt: pastScheduled },
    });
    if (!pastExists) {
      await washJobRepo.save(
        washJobRepo.create({
          providerId: provider.id,
          clientId: pastClient.id,
          carId: pastCar.id,
          assignedWorkerId: providerWorker.id,
          status: WashJobStatus.COMPLETED,
          scheduledAt: pastScheduled,
          startedAt: new Date(pastScheduled.getTime() + 10 * 60000),
          completedAt: new Date(pastScheduled.getTime() + 25 * 60000),
        }),
      );
    }
  }
  console.log('Wash jobs created (today + past)');

  // —— Payments ——
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  for (let i = 0; i < Math.min(4, clients.length); i++) {
    const client = clients[i];
    const existing = await paymentRepo.findOne({
      where: { providerId: provider.id, clientId: client.id, periodMonth: thisMonth, periodYear: thisYear, type: PaymentType.MONTHLY_RENEWAL },
    });
    if (!existing) {
      await paymentRepo.save(
        paymentRepo.create({
          providerId: provider.id,
          clientId: client.id,
          amount: '150',
          method: PaymentMethod.CASH,
          status: PaymentStatus.PAID,
          type: PaymentType.MONTHLY_RENEWAL,
          periodMonth: thisMonth,
          periodYear: thisYear,
        }),
      );
    }
  }
  // One pending
  const pendingClient = clients[clients.length - 1];
  const pendingExists = await paymentRepo.findOne({
    where: { providerId: provider.id, clientId: pendingClient.id, periodMonth: thisMonth, periodYear: thisYear },
  });
  if (!pendingExists) {
    await paymentRepo.save(
      paymentRepo.create({
        providerId: provider.id,
        clientId: pendingClient.id,
        amount: '150',
        method: PaymentMethod.WALLET,
        status: PaymentStatus.PENDING,
        type: PaymentType.MONTHLY_RENEWAL,
        periodMonth: thisMonth,
        periodYear: thisYear,
      }),
    );
  }
  console.log('Payments created (PAID + 1 PENDING)');

  // —— Client Comments ——
  const commentClient = clients[0];
  const commentExists = await clientCommentRepo.findOne({ where: { clientId: commentClient.id } });
  if (!commentExists) {
    await clientCommentRepo.save([
      clientCommentRepo.create({
        clientId: commentClient.id,
        authorId: providerAdmin.id,
        text: 'Prefers morning slots. Car is usually dusty from desert road.',
      }),
      clientCommentRepo.create({
        clientId: commentClient.id,
        authorId: providerWorker.id,
        text: 'Completed wash on time. No issues.',
      }),
    ]);
  }
  const commentClient2 = clients[1];
  const comment2Exists = await clientCommentRepo.findOne({ where: { clientId: commentClient2.id } });
  if (!comment2Exists) {
    await clientCommentRepo.save(
      clientCommentRepo.create({
        clientId: commentClient2.id,
        authorId: providerAdmin.id,
        text: 'VIP – handle with care.',
      }),
    );
  }
  console.log('Client comments created');

  // —— Notifications (optional) ——
  for (const client of clients.slice(0, 2)) {
    const exists = await notificationRepo.findOne({ where: { clientId: client.id } });
    if (!exists) {
      await notificationRepo.save(
        notificationRepo.create({
          clientId: client.id,
          titleKey: 'notification.renewal_reminder',
          bodyKey: 'notification.renewal_reminder_body',
          params: { month: thisMonth, year: thisYear },
          read: false,
        }),
      );
    }
  }
  console.log('Notifications created');

  // —— Second Provider (optional) ——
  let provider2: Provider | null = await providerRepo.findOne({ where: { name: 'Cairo Wash Co' } });
  if (!provider2) {
    provider2 = await providerRepo.save(
      providerRepo.create({
        name: 'Cairo Wash Co',
        subscriptionPlan: 'MONTHLY',
        subscriptionStatus: 'ACTIVE',
        enabled: true,
      }),
    );
    const hash2 = await bcrypt.hash('cairo123', SALT_ROUNDS);
    await providerUserRepo.save(
      providerUserRepo.create({
        providerId: provider2.id,
        name: 'Cairo Admin',
        phone: '+202111111111',
        passwordHash: hash2,
        role: ProviderUserRole.ADMIN,
      }),
    );
    const client2 = await clientRepo.save(
      clientRepo.create({
        providerId: provider2.id,
        name: 'Cairo Client',
        phone: '+202222222222',
        enrolledAt: new Date(),
        enrollmentCode: 'CAI01',
      }),
    );
    await carRepo.save(
      carRepo.create({
        clientId: client2.id,
        plateNumber: 'CAI-0001',
        model: 'Fiat',
        color: 'Blue',
      }),
    );
    console.log('Second provider + client created');
  }

  await ds.destroy();

  // —— Print credentials ——
  console.log('\n========== SEED CREDENTIALS (use these to log in) ==========\n');
  console.log('Super Admin (full access):');
  console.log('  Email:    admin@washhub.com');
  console.log('  Password: admin123');
  console.log('  → Login as Super Admin, go to /super\n');

  console.log('Provider Admin (Demo Provider):');
  console.log('  Phone:       +201111111111');
  console.log('  Password:   provider123');
  console.log('  Provider ID: ' + provider.id);
  console.log('  → Login as Provider, go to /provider\n');

  console.log('Provider Worker (Demo Provider):');
  console.log('  Phone:       +201000000000');
  console.log('  Password:   worker123');
  console.log('  Provider ID: ' + provider.id);
  console.log('  → Login as Provider (worker), go to /worker\n');

  console.log('Second Provider Admin (Cairo Wash Co):');
  console.log('  Phone:       +202111111111');
  console.log('  Password:   cairo123');
  console.log('  Provider ID: ' + (provider2?.id ?? 'run seed to get id'));
  console.log('  → Login as Provider, go to /provider\n');

  console.log('Client OTP (any client phone, dev only):');
  console.log('  Set DEV_MODE=true in .env');
  console.log('  Request OTP for e.g. +201222222222, then verify with code: 0000');
  console.log('  → Use from Client App / API\n');

  console.log('============================================================\n');
  console.log('Seed done. Backend: npm run start:dev | Admin: cd apps/admin-web && npm run dev');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
