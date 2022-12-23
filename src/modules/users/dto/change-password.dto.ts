import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  newPassword: string;
}
