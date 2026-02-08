import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../entities/car.entity';
import { Client } from '../entities/client.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly repo: Repository<Car>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async create(dto: CreateCarDto, providerId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: dto.clientId, providerId },
    });
    if (!client) throw new NotFoundException('Client not found');
    const car = this.repo.create({
      clientId: dto.clientId,
      plateNumber: dto.plateNumber,
      model: dto.model ?? null,
      color: dto.color ?? null,
    });
    return this.repo.save(car);
  }

  async findAllByClient(clientId: string, providerId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId, providerId },
    });
    if (!client) throw new NotFoundException('Client not found');
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, providerId: string) {
    const car = await this.repo.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!car || car.client.providerId !== providerId) throw new NotFoundException('Car not found');
    return car;
  }

  async update(id: string, providerId: string, dto: UpdateCarDto) {
    const car = await this.findOne(id, providerId);
    Object.assign(car, dto);
    return this.repo.save(car);
  }

  async remove(id: string, providerId: string) {
    const car = await this.findOne(id, providerId);
    await this.repo.remove(car);
    return { deleted: true };
  }

  /** Count all cars under a provider (via clients). Used for per-car billing. */
  async countByProvider(providerId: string): Promise<number> {
    return this.repo
      .createQueryBuilder('car')
      .innerJoin('car.client', 'client')
      .where('client.providerId = :providerId', { providerId })
      .getCount();
  }
}
