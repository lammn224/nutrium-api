import { IsNotEmpty, IsEmail, Validate } from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/modules/users/user.schema';
import { IsUserAlreadyExist } from '../validation/is-user-already-exist';

export class CreateUserDto extends PickType(User, [
  'email',
  'password',
  'fullName',
  'status',
  'role',
  'dateOfBirth',
] as const) {
  @IsNotEmpty()
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  email: string;
}
