import { IsString, MinLength } from 'class-validator';

export class CreateWashJobCommentDto {
  @IsString()
  @MinLength(1)
  text: string;
}
