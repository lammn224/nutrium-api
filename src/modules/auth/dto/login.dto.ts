import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsObjectId } from '@/dtos/valdation/is-objectId';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsObjectId)
  @ApiProperty({ type: String, required: true })
  school: string;
}
