import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenVerificationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  roleName;
}
