import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { IsSchoolAlreadyExist } from '@/modules/schools/validation/is-school-already-exist';
import { Prop } from '@nestjs/mongoose';
import { CreateSchoolUserDto } from '@/modules/school-users/dto/create-school-user.dto';
import { School } from '@/modules/schools/schools.schema';

export class CreateSchoolDto extends IntersectionType(
  CreateSchoolUserDto,
  PickType(School, ['code', 'name'] as const),
) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Validate(IsSchoolAlreadyExist)
  code: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: true })
  @Prop({ type: String, required: true })
  password: string;
}
