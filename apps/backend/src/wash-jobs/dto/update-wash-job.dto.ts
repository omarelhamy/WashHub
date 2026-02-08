import { PartialType } from '@nestjs/mapped-types';
import { CreateWashJobDto } from './create-wash-job.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateWashJobDto extends PartialType(CreateWashJobDto) {
  @IsOptional()
  @IsIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])
  status?: string;
}
