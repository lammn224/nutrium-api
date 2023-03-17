import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserGender } from '@/modules/school-users/enum/user-gender.enum';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  studentId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  fullName;

  @IsNotEmpty()
  @IsEnum(UserGender)
  @ApiProperty({ enum: UserGender, default: UserGender.male })
  gender: UserGender;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number, required: true })
  dateOfBirth;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  parentsFullName;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  parentsPhoneNumber;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  class: string;
}
