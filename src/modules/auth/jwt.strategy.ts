import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SchoolUsersService } from '../school-users/school-users.service';
import { UserStatus } from '../school-users/enum/user-status.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private schoolUsersService: SchoolUsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.schoolUsersService.findById(payload._id);

    if (!user || user.status !== UserStatus.active) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
