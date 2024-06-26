import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { SchoolsModule } from '../schools/schools.module';
import { AuthValidationMiddleware } from './middlewares/auth-validation-middleware';
import { StudentsLocalStrategy } from '@/modules/auth/students-local.strategy';
import { StudentsModule } from '@/modules/students/students.module';
import { SysadminLocalStrategy } from '@/modules/auth/sysadmin-local.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: `${configService.get('JWT_TTL')}s` },
      }),
      inject: [ConfigService],
    }),
    SchoolsModule,
    StudentsModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    StudentsLocalStrategy,
    SysadminLocalStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthValidationMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }
}
