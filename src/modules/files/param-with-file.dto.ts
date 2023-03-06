import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ParamWithFileDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  grade: string;
}
