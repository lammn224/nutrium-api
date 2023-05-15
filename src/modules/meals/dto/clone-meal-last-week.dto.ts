import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject } from 'class-validator';

export class CloneMealLastWeekDto {
  @ApiProperty({ type: Object, required: true, default: null })
  @IsNotEmpty()
  srcWeek: object;

  @ApiProperty({ type: Object, required: true, default: null })
  @IsNotEmpty()
  desWeek: object;

  @ApiProperty({ type: [Number], default: [] })
  @IsArray()
  dayChecked: [number];
}
