import { Injectable } from '@nestjs/common';
import { SchoolUsersService } from '../school-users/school-users.service';
import { JwtService } from '@nestjs/jwt';
import { SchoolUser } from '../school-users/school-user.schema';
import { RegisterDto } from './dto/register.dto';
import { SchoolsService } from '../schools/schools.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private schoolUsersService: SchoolUsersService,
    private schoolService: SchoolsService,
    private jwtService: JwtService,
  ) {}

  async validateSchoolUser({
    username,
    password,
    school,
  }: LoginDto): Promise<any> {
    const checkInfo = await this.schoolUsersService.attempt(
      username,
      password,
      school,
    );

    if (checkInfo.canReturnToken) {
      delete checkInfo.schoolUser.password;
    }

    return checkInfo;
  }

  async login(user: SchoolUser) {
    const payload = {
      username: user.username,
      _id: user._id,
      shcool: user.school,
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
