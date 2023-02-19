import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Student } from '@/modules/students/students.schema';
import { Type } from 'class-transformer';

export class UpdateStudentInfoDto extends PickType(Student, [
  'fullName',
  'dateOfBirth',
  'weight',
  'height',
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
}
