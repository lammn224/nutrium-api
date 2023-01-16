import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_CODES } from '@/constants/error-codes.constant';

@Injectable()
export class StudentsLocalStrategy extends PassportStrategy(
  Strategy,
  'student-local',
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'studentId',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(request, studentId: string, password: string): Promise<any> {
    const { school } = request.body;
    const checkInfo = await this.authService.validateStudent({
      studentId,
      password,
      school,
    });

    if (!checkInfo.canReturnToken) {
      throw new UnauthorizedException({
        code: checkInfo.status.toUpperCase(),
        message: ERROR_CODES.get(checkInfo.status.toUpperCase()),
      });
    }

    return checkInfo.student;
  }
}
