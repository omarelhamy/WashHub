import { IsString, MinLength, IsIn } from 'class-validator';

export class CreateProviderUserDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['ADMIN', 'WORKER'])
  role: string;

  @IsString()
  providerId: string;
}
