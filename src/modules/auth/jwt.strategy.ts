import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SchoolUsersService } from '../school-users/school-users.service';
import { UserStatus } from '../school-users/enum/user-status.enum';
import { StudentsService } from '@/modules/students/students.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private schoolUsersService: SchoolUsersService,
    private studentService: StudentsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    let user;
    if (payload.studentId) {
      user = await this.studentService.findById(payload._id);
    } else {
      user = await this.schoolUsersService.findById(payload._id);
    }

    if (!user || user.status !== UserStatus.active) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
