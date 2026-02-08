import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderUserDto } from './create-provider-user.dto';

export class UpdateProviderUserDto extends PartialType(CreateProviderUserDto) {}
