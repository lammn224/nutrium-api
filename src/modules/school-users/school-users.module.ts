import { Global, Module } from '@nestjs/common';
import { SchoolUsersService } from './school-users.service';
import { SchoolUsersController } from './school-users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolUser, SchoolUserSchema } from './school-user.schema';
import { IsUserAlreadyExist } from './validation/is-user-already-exist';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchoolUser.name, schema: SchoolUserSchema },
    ]),
  ],
  controllers: [SchoolUsersController],
  providers: [SchoolUsersService, IsUserAlreadyExist],
  exports: [SchoolUsersService],
})
export class SchoolUsersModule {}
