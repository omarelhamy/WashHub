import { IsString, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  enrollmentCode?: string;

  @IsString()
  providerId: string;
}
