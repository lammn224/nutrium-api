import { Module } from '@nestjs/common';
import { MealCompilationUpdateListener } from '@/listeners/meal-compilation/meal-compilation-update.listener';
import { MealsModule } from '@/modules/meals/meals.module';

@Module({
  imports: [MealsModule],
  providers: [MealCompilationUpdateListener],
})
export class ListenersModule {}
