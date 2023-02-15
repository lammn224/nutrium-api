import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TimestampDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  ts: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  studentId: string;
}
