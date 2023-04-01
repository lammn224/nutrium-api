import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Student } from '@/modules/students/students.schema';
import { Type } from 'class-transformer';
import { UserGender } from '@/modules/school-users/enum/user-gender.enum';
import { ActivityType } from '@/modules/students/enum/activity-type.enum';

export class UpdateStudentInfoDto extends PickType(Student, [
  'fullName',
  'dateOfBirth',
  'weight',
  'height',
  'bmi',
  'rcmCalories',
  'gender',
] as const) {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number })
  dateOfBirth: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  fullName: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  weight: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  height: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  bmi: number;

  @IsOptional()
  @IsEnum(UserGender)
  @ApiProperty({ enum: UserGender, default: UserGender.male })
  gender: UserGender;

  @IsOptional()
  @IsEnum(ActivityType)
  @ApiProperty({ enum: ActivityType, default: ActivityType.LIGHT })
  activityType: ActivityType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number })
  rcmCalories: number;
}
