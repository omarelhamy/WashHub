import { IsString, Length } from 'class-validator';

export class ClientVerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  @Length(4, 6)
  code: string;

  @IsString()
  providerId: string;
}
