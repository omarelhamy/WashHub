import { IsString } from 'class-validator';

export class ClientRequestOtpDto {
  @IsString()
  phone: string;

  @IsString()
  providerId: string;
}
