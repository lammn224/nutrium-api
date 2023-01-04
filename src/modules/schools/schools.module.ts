import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from './schools.schema';
import { SchoolUsersModule } from '../school-users/school-users.module';
import { IsSchoolAlreadyExist } from './validation/is-school-already-exist';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: School.name, schema: SchoolSchema }]),
    SchoolUsersModule,
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService, IsSchoolAlreadyExist],
  exports: [SchoolsService],
})
export class SchoolsModule {}
