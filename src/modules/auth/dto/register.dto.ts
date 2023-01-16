import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { School } from '@/modules/schools/schools.schema';
import { CreateSchoolUserDto } from '@/modules/school-users/dto/create-school-user.dto';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsSchoolAlreadyExist } from '@/modules/schools/validation/is-school-already-exist';

export class RegisterDto extends IntersectionType(
  CreateSchoolUserDto,
  PickType(School, ['code', 'name'] as const),
) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Validate(IsSchoolAlreadyExist)
  code: string;
}
