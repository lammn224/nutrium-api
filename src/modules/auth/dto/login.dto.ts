import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsObjectId } from '@/dtos/valdation/is-objectId';
import { School } from '@/modules/schools/schools.schema';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsObjectId)
  @ApiProperty({ type: String, required: true })
  school: string | School;
}
