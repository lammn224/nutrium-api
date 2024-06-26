import {
  CacheModule,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { SchoolUsersModule } from './modules/school-users/school-users.module';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt-auth-guard';
import { CacheModule as CacheCustomModule } from './modules/cache/cache.module';
import { TokenBlacklistMiddleware } from './middlewares/token-blacklist.middleware';
import { RolesGuard } from './guards/roles.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ListenersModule } from './listeners/listeners.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { FoodsModule } from './modules/foods/foods.module';
import { FilesModule } from '@/modules/files/files.module';
import { ClassesModule } from './modules/classes/classes.module';
import { StudentsModule } from './modules/students/students.module';
import { MealsModule } from './modules/meals/meals.module';
import { GradeModule } from '@/modules/grade/grade.module';
import { ActivityModule } from '@/modules/activities/activity.module';
import { HealthCheckApiMiddleware } from '@/middlewares/health-check-api.middleware';
import { ScheduleExerciseModule } from '@/modules/scheduleExercise/scheduleExercise.module';
import { MealCompilationModule } from './modules/meal-compilation/meal-compilation.module';
import { MomentProvider } from '@/providers/moment.provider';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        // url: 'rediss://red-ckoddulih1lc73eogcfg:o7udzJbfUIARFxwlkZrMBR3FDOtZkgDZ@singapore-redis.render.com',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 6000,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    SchoolUsersModule,
    CacheCustomModule,
    ListenersModule,
    SchoolsModule,
    FoodsModule,
    FilesModule,
    ClassesModule,
    StudentsModule,
    MealsModule,
    GradeModule,
    ActivityModule,
    ScheduleExerciseModule,
    MealCompilationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MomentProvider,
    Logger,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TokenBlacklistMiddleware, HealthCheckApiMiddleware)
      .exclude('auth/login')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
