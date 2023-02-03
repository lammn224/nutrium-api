import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Student } from '@/modules/students/students.schema';

export class UpdateStudentInfoDto extends PickType(Student, [
  'fullName',
  'dateOfBirth',
] as const) {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number })
  dateOfBirth: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  fullName: string;
}
