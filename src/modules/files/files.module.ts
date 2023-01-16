import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { SchoolUsersModule } from '@/modules/school-users/school-users.module';
import { ClassesModule } from '@/modules/classes/classes.module';
import { StudentsModule } from '@/modules/students/students.module';

@Module({
  imports: [SchoolUsersModule, ClassesModule, StudentsModule],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
