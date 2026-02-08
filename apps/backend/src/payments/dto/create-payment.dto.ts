import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  providerId: string;

  @IsString()
  clientId: string;

  @IsOptional()
  @IsString()
  washJobId?: string;

  @IsNumber()
  amount: number;

  @IsIn(['CASH', 'WALLET', 'CARD'])
  method: string;

  @IsIn(['PENDING', 'PAID'])
  status: string;

  @IsOptional()
  @IsIn(['ONE_TIME', 'MONTHLY_RENEWAL'])
  type?: string;

  @IsOptional()
  @IsNumber()
  periodMonth?: number;

  @IsOptional()
  @IsNumber()
  periodYear?: number;
}
