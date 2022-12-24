import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '@/modules/users/user.schema';
import { IsNotEmpty, IsString, IsEmail, Validate } from 'class-validator';
import { IsUserAlreadyExist } from './validation/is-user-already-exist';

export class RegisterDto extends PickType(User, [
  'email',
  'password',
  'fullName',
  'role',
] as const) {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  @ApiProperty({ type: String, required: true })
  email: string;
}
