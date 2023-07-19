import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SysadminLoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  password: string;
}
