import { PickType } from '@nestjs/swagger';
import { SchoolUser } from '../school-user.schema';

export class CreateParentsDto extends PickType(SchoolUser, [
  'fullName',
  'password',
  'phoneNumber',
  'role',
  'status',
  'child',
] as const) {}
