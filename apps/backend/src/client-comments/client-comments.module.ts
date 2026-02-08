import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientComment } from '../entities/client-comment.entity';
import { Client } from '../entities/client.entity';
import { ClientCommentsService } from './client-comments.service';
import { ClientCommentsController } from './client-comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientComment, Client])],
  controllers: [ClientCommentsController],
  providers: [ClientCommentsService],
  exports: [ClientCommentsService],
})
export class ClientCommentsModule {}
