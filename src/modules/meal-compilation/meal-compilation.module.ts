import { Module } from '@nestjs/common';
import { MealCompilationService } from './meal-compilation.service';
import { MealCompilationController } from './meal-compilation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MealCompilation,
  MealCompilationSchema,
} from '@/modules/meal-compilation/meal-compilation.schema';
import { StudentsModule } from '@/modules/students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MealCompilation.name, schema: MealCompilationSchema },
    ]),
    StudentsModule,
  ],
  controllers: [MealCompilationController],
  providers: [MealCompilationService],
  exports: [MealCompilationService],
})
export class MealCompilationModule {}
