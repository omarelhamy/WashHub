import { IsString, IsOptional } from 'class-validator';

export class CreateCarDto {
  @IsString()
  clientId: string;

  @IsString()
  plateNumber: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
