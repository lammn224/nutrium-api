import { IntersectionType, PickType } from '@nestjs/swagger';
import { School } from '@/modules/schools/schools.schema';
import { SchoolUser } from '@/modules/school-users/school-user.schema';
import { CreateSchoolUserDto } from '@/modules/school-users/dto/create-school-user.dto';
import { Validate } from 'class-validator';
import { IsSchoolAlreadyExist } from '@/modules/schools/validation/is-school-already-exist';

export class RegisterDto extends IntersectionType(
  CreateSchoolUserDto,
  PickType(School, ['code', 'name'] as const),
) {
  @Validate(IsSchoolAlreadyExist)
  code: string;
}
