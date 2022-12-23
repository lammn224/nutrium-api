import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { IsObjectId } from '@/dtos/valdation/is-objectId';

export class IdRequestDto {
  @ApiProperty({
    required: true,
    default: '',
  })
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  @Validate(IsObjectId)
  id: string;
}
