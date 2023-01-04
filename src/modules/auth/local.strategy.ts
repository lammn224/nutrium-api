import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_CODES } from '@/constants/error-codes.constant';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(request, username: string, password: string): Promise<any> {
    const { school } = request.body;
    const checkInfo = await this.authService.validateSchoolUser({
      username,
      password,
      school,
    });

    if (!checkInfo.canReturnToken) {
      throw new UnauthorizedException({
        code: checkInfo.status.toUpperCase(),
        message: ERROR_CODES.get(checkInfo.status.toUpperCase()),
      });
    }

    return checkInfo.schoolUser;
  }
}
