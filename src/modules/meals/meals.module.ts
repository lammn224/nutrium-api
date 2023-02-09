import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Meals, MealsSchema } from '@/modules/meals/meals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meals.name, schema: MealsSchema }]),
  ],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
