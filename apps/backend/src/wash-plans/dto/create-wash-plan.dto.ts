import { IsString, IsArray, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateWashPlanDto {
  @IsOptional()
  @IsString()
  providerId?: string;

  @IsString()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek: number[];

  @IsNumber()
  timesPerWeek: number;

  @IsIn(['INSIDE', 'OUTSIDE'])
  location: string;

  @IsNumber()
  washesInPlan: number;

  @IsOptional()
  @IsNumber()
  periodWeeks?: number;
}
