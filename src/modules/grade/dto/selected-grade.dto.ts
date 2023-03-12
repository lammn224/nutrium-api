import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectedGradeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  grade: string;
}
