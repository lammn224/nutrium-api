import { PickType } from '@nestjs/swagger';
import { SchoolUser } from '../school-user.schema';

export class CreateSchoolUserDto extends PickType(SchoolUser, [
  'fullName',
  'username',
  'password',
  'phoneNumber',
] as const) {}
