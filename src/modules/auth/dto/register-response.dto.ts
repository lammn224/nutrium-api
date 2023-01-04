import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { LoginResponseDto } from '@/modules/auth/dto/login.response.dto';
import { SchoolUser } from '@/modules/school-users/school-user.schema';
import { School } from '@/modules/schools/schools.schema';

export class RegisterResponseDto extends PickType(LoginResponseDto, [
  'access_token',
] as const) {
  @ApiProperty({ type: School, required: true })
  school: School;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: SchoolUser, required: true })
  owner: SchoolUser;
}
