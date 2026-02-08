import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateWashJobDto {
  @IsOptional()
  @IsString()
  providerId?: string;

  @IsString()
  clientId: string;

  @IsString()
  carId: string;

  @IsOptional()
  @IsString()
  assignedWorkerId?: string;

  @IsDateString()
  scheduledAt: string;
}
