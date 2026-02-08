import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto, providerId: string) {
    const client = this.repo.create({
      ...dto,
      providerId: providerId || dto.providerId,
      enrolledAt: new Date(),
    });
    return this.repo.save(client);
  }

  async findAll(providerId: string, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { providerId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  /** Super admin: list all clients, optionally filtered by providerId */
  async findAllForSuperAdmin(providerId: string | undefined, page = 1, limit = 50) {
    const qb = this.repo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.provider', 'provider')
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (providerId) qb.where('c.providerId = :providerId', { providerId });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string, providerId: string) {
    const client = await this.repo.findOne({ where: { id, providerId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, providerId: string, dto: UpdateClientDto) {
    const client = await this.findOne(id, providerId);
    Object.assign(client, dto);
    return this.repo.save(client);
  }

  async remove(id: string, providerId: string) {
    const client = await this.findOne(id, providerId);
    await this.repo.remove(client);
    return { deleted: true };
  }
}
