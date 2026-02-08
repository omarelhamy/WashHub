import { IsString, IsIn } from 'class-validator';

export class CreateWashStageDto {
  @IsString()
  washJobId: string;

  @IsIn(['ARRIVED', 'WASHING', 'FINISHING'])
  stage: string;
}
