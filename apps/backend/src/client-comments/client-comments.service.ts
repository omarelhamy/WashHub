import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientComment } from '../entities/client-comment.entity';
import { Client } from '../entities/client.entity';
import { CreateClientCommentDto } from './dto/create-client-comment.dto';

@Injectable()
export class ClientCommentsService {
  constructor(
    @InjectRepository(ClientComment)
    private readonly repo: Repository<ClientComment>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async create(dto: CreateClientCommentDto, authorId: string, providerId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: dto.clientId, providerId },
    });
    if (!client) throw new NotFoundException('Client not found');
    const comment = this.repo.create({
      clientId: dto.clientId,
      authorId,
      text: dto.text,
    });
    return this.repo.save(comment);
  }

  async findByClient(clientId: string, providerId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId, providerId },
    });
    if (!client) throw new NotFoundException('Client not found');
    return this.repo.find({
      where: { clientId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }
}
