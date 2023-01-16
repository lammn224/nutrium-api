import { Injectable } from '@nestjs/common';
import { SchoolUsersService } from '../school-users/school-users.service';
import { JwtService } from '@nestjs/jwt';
import { SchoolUser } from '../school-users/school-user.schema';
import { RegisterDto } from './dto/register.dto';
import { SchoolsService } from '../schools/schools.service';
import { LoginDto } from './dto/login.dto';
import { StudentLoginDto } from '@/modules/auth/dto/login-students.dto';
import { Student } from '@/modules/students/students.schema';
import { StudentsService } from '@/modules/students/students.service';

@Injectable()
export class AuthService {
  constructor(
    private schoolUsersService: SchoolUsersService,
    private studentService: StudentsService,
    private schoolService: SchoolsService,
    private jwtService: JwtService,
  ) {}

  async validateSchoolUser({
    phoneNumber,
    password,
    school,
  }: LoginDto): Promise<any> {
    const checkInfo = await this.schoolUsersService.attempt(
      phoneNumber,
      password,
      school,
    );

    if (checkInfo.canReturnToken) {
      delete checkInfo.schoolUser.password;
    }

    return checkInfo;
  }

  async validateStudent({
    studentId,
    password,
    school,
  }: StudentLoginDto): Promise<any> {
    const checkInfo = await this.studentService.attempt(
      studentId,
      password,
      school,
    );

    if (checkInfo.canReturnToken) {
      delete checkInfo.student.password;
    }

    return checkInfo;
  }

  async login(user: SchoolUser) {
    const payload = {
      phoneNumber: user.phoneNumber,
      _id: user._id,
      school: user.school,
      role: user.role,
      sub: user._id,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: parseInt(process.env.JWT_TTL),
      }),
    };
  }

  async studentLogin(user: Student) {
    const payload = {
      studentId: user.studentId,
      _id: user._id,
      school: user.school,
      role: user.role,
      sub: user._id,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: parseInt(process.env.JWT_TTL),
      }),
    };
  }

  async register(registerDto: RegisterDto) {
    const { school, owner } = await this.schoolService.createSchool(
      registerDto,
    );

    const { access_token } = await this.login(owner);
    return { school, owner, access_token };
  }
}
