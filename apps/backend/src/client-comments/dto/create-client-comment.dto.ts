import { IsString } from 'class-validator';

export class CreateClientCommentDto {
  @IsString()
  clientId: string;

  @IsString()
  text: string;
}
