import { IsString, IsArray, IsNumber, IsOptional, IsIn } from 'class-validator';

export class UpdateWashPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @IsNumber()
  timesPerWeek?: number;

  @IsOptional()
  @IsIn(['INSIDE', 'OUTSIDE'])
  location?: string;

  @IsOptional()
  @IsNumber()
  washesInPlan?: number;

  @IsOptional()
  @IsNumber()
  periodWeeks?: number | null;
}
