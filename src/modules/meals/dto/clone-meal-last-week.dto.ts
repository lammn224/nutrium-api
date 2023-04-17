import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class CloneMealLastWeekDto {
  @ApiProperty({ type: [Number], default: [] })
  @IsArray()
  dayChecked: [number];
}
