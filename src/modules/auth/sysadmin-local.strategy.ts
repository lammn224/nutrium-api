import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_CODES } from '@/constants/error-codes.constant';

@Injectable()
export class SysadminLocalStrategy extends PassportStrategy(
  Strategy,
  'sysadmin-local',
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phoneNumber',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(request, phoneNumber: string, password: string): Promise<any> {
    const checkInfo = await this.authService.validateSysadmin({
      phoneNumber,
      password,
    });

    if (!checkInfo.canReturnToken) {
      throw new UnauthorizedException({
        code: checkInfo.status.toUpperCase(),
        message: ERROR_CODES.get(checkInfo.status.toUpperCase()),
      });
    }

    return checkInfo.user;
  }
}
