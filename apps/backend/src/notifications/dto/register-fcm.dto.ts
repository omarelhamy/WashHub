import { IsString, IsOptional } from 'class-validator';

export class RegisterFcmDto {
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  platform?: string;
}
