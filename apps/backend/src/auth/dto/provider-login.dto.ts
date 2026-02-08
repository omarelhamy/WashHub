import { IsString, MinLength } from 'class-validator';

export class ProviderLoginDto {
  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
