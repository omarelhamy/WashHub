import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProviderUser } from '../entities/provider-user.entity';
import { ProviderUserRole } from '../entities/provider-user.entity';
import { CreateProviderUserDto } from './dto/create-provider-user.dto';
import { UpdateProviderUserDto } from './dto/update-provider-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class ProviderUsersService {
  constructor(
    @InjectRepository(ProviderUser)
    private readonly repo: Repository<ProviderUser>,
  ) {}

  async create(dto: CreateProviderUserDto, providerId: string) {
    const existing = await this.repo.findOne({
      where: { providerId, phone: dto.phone },
    });
    if (existing) throw new ConflictException('Phone already exists for this provider');
    const hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.repo.create({
      providerId: providerId || dto.providerId,
      name: dto.name,
      phone: dto.phone,
      passwordHash: hash,
      role: dto.role as ProviderUserRole,
    });
    return this.repo.save(user);
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

  async findOne(id: string, providerId: string) {
    const user = await this.repo.findOne({
      where: { id, providerId },
    });
    if (!user) throw new NotFoundException('Provider user not found');
    return user;
  }

  async update(id: string, providerId: string, dto: UpdateProviderUserDto) {
    const user = await this.findOne(id, providerId);
    if (dto.name != null) user.name = dto.name;
    if (dto.phone != null) user.phone = dto.phone;
    if (dto.role != null) user.role = dto.role as ProviderUserRole;
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.repo.save(user);
  }

  async remove(id: string, providerId: string) {
    const user = await this.findOne(id, providerId);
    await this.repo.remove(user);
    return { deleted: true };
  }
}
