import { RequestContext } from '@/dtos/request-context';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email']),
) {
  @Allow()
  context?: RequestContext;
}
