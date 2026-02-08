import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { ClientFcmToken } from '../entities/client-fcm-token.entity';
import { Client } from '../entities/client.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(ClientFcmToken)
    private readonly fcmRepo: Repository<ClientFcmToken>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async create(clientId: string, titleKey: string, bodyKey?: string, params?: Record<string, unknown>) {
    const notification = this.notificationRepo.create({
      clientId,
      titleKey,
      bodyKey: bodyKey ?? null,
      params: params ?? null,
    });
    return this.notificationRepo.save(notification);
  }

  async findByClient(clientId: string, providerId: string, page = 1, limit = 20) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId, providerId },
    });
    if (!client) throw new NotFoundException('Client not found');
    const [items, total] = await this.notificationRepo.findAndCount({
      where: { clientId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async registerFcmToken(clientId: string, token: string, deviceId?: string, platform?: string) {
    const existing = await this.fcmRepo.findOne({
      where: { clientId, deviceId: deviceId ?? undefined },
    });
    if (existing) {
      existing.token = token;
      existing.platform = platform ?? null;
      return this.fcmRepo.save(existing);
    }
    const fcm = this.fcmRepo.create({
      clientId,
      token,
      deviceId: deviceId ?? null,
      platform: platform ?? null,
    });
    return this.fcmRepo.save(fcm);
  }
}
