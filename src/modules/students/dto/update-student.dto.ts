import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  studentId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  class: string;
}
