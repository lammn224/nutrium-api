import { ApiProperty, PickType } from '@nestjs/swagger';
import { SchoolUser } from '../school-user.schema';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserInfoDto extends PickType(SchoolUser, [
  'fullName',
  'phoneNumber',
] as const) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  fullName: string;
}
