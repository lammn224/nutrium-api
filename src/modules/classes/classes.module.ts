import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Classes, ClassesSchema } from '@/modules/classes/classes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Classes.name, schema: ClassesSchema }]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
