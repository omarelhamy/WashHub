import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { Client } from '../entities/client.entity';
import { Car } from '../entities/car.entity';
import { EnrollDto } from './dto/enroll.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Car)
    private readonly carRepo: Repository<Car>,
  ) {}

  async enroll(dto: EnrollDto) {
    const provider = await this.providerRepo.findOne({
      where: { enabled: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    const enrollmentCode = dto.code.trim() || provider.id.slice(0, 8);
    let client = await this.clientRepo.findOne({
      where: { phone: dto.phone, providerId: provider.id },
    });
    if (!client) {
      client = this.clientRepo.create({
        providerId: provider.id,
        name: dto.name,
        phone: dto.phone,
        enrollmentCode,
        enrolledAt: new Date(),
      });
      await this.clientRepo.save(client);
    }
    if (dto.plateNumber) {
      const existingCar = await this.carRepo.findOne({
        where: { clientId: client.id, plateNumber: dto.plateNumber },
      });
      if (!existingCar) {
        const car = this.carRepo.create({
          clientId: client.id,
          plateNumber: dto.plateNumber,
          model: dto.model ?? null,
          color: dto.color ?? null,
        });
        await this.carRepo.save(car);
      }
    }
    return {
      provider: { id: provider.id, name: provider.name },
      client: { id: client.id, name: client.name, phone: client.phone },
    };
  }
}
