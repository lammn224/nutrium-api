import { IsNotEmpty, IsEmail, Validate, IsString } from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '@/modules/users/user.schema';
import { IsUserAlreadyExist } from '@/modules/users/validation/is-user-already-exist';

export class RegisterDto extends PickType(User, ['password'] as const) {
  @IsNotEmpty()
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: string;
}
