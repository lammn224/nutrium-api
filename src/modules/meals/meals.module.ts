import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Meals, MealsSchema } from '@/modules/meals/meals.schema';
import { StudentsModule } from '@/modules/students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meals.name, schema: MealsSchema }]),
    StudentsModule,
  ],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
